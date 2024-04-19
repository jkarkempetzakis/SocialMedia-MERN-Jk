import express from "express";
import { signupUser, loginUser, logoutUser, followUnfollowUser, updateUserProfile, getUserProfile, getUserByReply, getSuggestedUsers } from "../controllers/user.controller.js";
import routeProtector from "../middleware/routeProtector.js"

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/reply/:id", getUserByReply);
router.get("/suggested", routeProtector, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", routeProtector, followUnfollowUser);
router.put("/update/:id", routeProtector, updateUserProfile)
export default router;