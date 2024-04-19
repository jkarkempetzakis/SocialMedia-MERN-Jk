import express from "express";
import routeProtector from "../middleware/routeProtector.js"
import { createPost, deletePost, getPost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, getUserReplies, getPostByReply } from "../controllers/post.controller.js"


const router = express.Router();

router.get("/feed", routeProtector, getFeedPosts);
router.get("/reply/:id", getPostByReply);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.get("/reply/user/:username", routeProtector, getUserReplies);
router.post("/create", routeProtector, createPost);
router.delete("/:id", routeProtector, deletePost);
router.put("/like/:id", routeProtector, likeUnlikePost);
router.put("/reply/:id", routeProtector, replyToPost);

export default router;