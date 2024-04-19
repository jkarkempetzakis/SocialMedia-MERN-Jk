import express from "express";
import protectRoute from "../middleware/routeProtector.js";
import { getMessages, sendMessage, getConversations, getUnreadMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/unread/:userId", protectRoute, getUnreadMessages)
router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);

export default router;