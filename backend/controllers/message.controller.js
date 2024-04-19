import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";


/*
    -Based on the recipient and current user id cheks to see if a conversation between them exists
    if not then create a new one otherwise continue populating the one found
    -Also uploads image via cloudinary
    -sends it to recipient via socket.io in real time
*/
async function sendMessage(req, res) {
    try {
        const { recipientId, message } = req.body;
        let { img } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    origin: null,
                    text: message,
                    sender: senderId,
                },
            });
            await conversation.save();
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
            img: img || "",
        });

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    origin: newMessage._id,
                    text: message,
                    sender: senderId,
                },
            }),
        ]);

        //get recipient id , if it exists send message via emit()
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
            console.log("emit sent")
        } else {
            console.log("user not connected")
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/*
-Gets messages between two users
-First finds a conversation between two users( if it exists) 
-Then finds the messages in that conversation
*/
async function getMessages(req, res) {
    const { otherUserId } = req.params;
    const userId = req.user._id;
    try {
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] },
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const messages = await Message.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getUnreadMessages(req, res) {
    const userId = req.user._id;

    try {
        const conversations = await Conversation.find({ participants: userId });
        if (!conversations) {
            // If conversation is not found, return null
            return res.status(404).json({ error: "Conversations not found" });
        }

        let unreadMessages = [];

        for (const conversation of conversations) {
            // Get the last message of the conversation
            const lastMessage = conversation.lastMessage;

            // Find the last message in the conversation
            const lastMessage2 = await Message.findOne({ _id: lastMessage.origin });

            // Check if the current user is not the sender of the last message
            if (lastMessage2 && lastMessage2.sender.toString() !== userId.toString() && !lastMessage2.seen) {
                console.log("Found an unread message:", lastMessage2);
                unreadMessages.push(lastMessage2);
            }
        }

        console.log("Unread messages:", unreadMessages);
        res.status(200).json(unreadMessages);

    } catch (error) {
        console.error("Error fetching unread messages:", error);
        res.status(500).json({ error: error.message });
    }
}


/*
-Getting all conversations that the user has 
-Using populate instead of another fetch request to get the username and pic for the sidebar
*/
async function getConversations(req, res) {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username name profilePic",
        });

        //removing the current user from the participants array to get only the other user's picture
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            );
        });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { sendMessage, getMessages, getConversations, getUnreadMessages };