import express from "express";
import { signupUser, loginUser, logoutUser, followUnfollowUser, updateUserProfile, getUserProfile } from "../controllers/user.controller.js";
import routeProtector from "../middleware/routeProtector.js"

const router = express.Router();

router.get("/profile/:query", getUserProfile)
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", routeProtector, followUnfollowUser);
router.post("/update/:id", routeProtector, updateUserProfile)
export default router;