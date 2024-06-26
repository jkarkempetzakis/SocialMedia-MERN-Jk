import Post from "../models/post.model.js";
import User from "../models/user.model.js";

import { v2 as cloudinary } from "cloudinary";

//sort of like twitter/threads character limit to post
const createPost = async (req, res) => {

    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;

        if (!text || !postedBy) {
            return res.status(400).json({ error: "Postedby and text are both required" })
        }
        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: " Unauthorized to create post" });

        }
        const maxLength = 500;
        if (text.length > maxLength) {

            return res.status(400).json({ error: `Text must be less than ${maxLength}` });
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();
        res.status(200).json(newPost);


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getPost = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }
        res.status(200).json(post)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
const getPostByReply = async (req, res) => {
    try {
        const post = await Post.find({ "replies._id": req.params.id });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }
        res.status(200).json(post)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: " Unauthorized to delete post" });

        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }
        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked successfully" })
        } else {
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post likes successfully" })

        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
const replyToPost = async (req, res) => {

    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });

        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });

        }
        const reply = { userId, username, userProfilePic, text };
        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);


    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
//find the posts made from the users in the current user's following list
const getFeedPosts = async (req, res) => {

    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;

        const postFeed = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 })

        res.status(200).json(postFeed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


}
const getUserPosts = async (req, res) => {

    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}


const getUserReplies = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        const userId = user._id;
        console.log(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ "replies.userId": userId });
        const filteredReplies = posts.map(post => {
            return post.replies.filter(reply => reply.userId.toString() === userId.toString());
        });

        // Respond with the replies array
        res.status(200).json(filteredReplies);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export { createPost, getPost, getPostByReply, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, getUserReplies };