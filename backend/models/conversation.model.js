import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        lastMessage: {
            origin: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
            text: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            seen: {
                type: Boolean,
                default: false,
            },
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;