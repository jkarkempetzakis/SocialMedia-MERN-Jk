import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import mongoose from "mongoose";
import Post from "../models/post.model.js"

const signupUser = async (req, res) => {

    try {
        const { name, username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });

        await newUser.save();
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,

            });
        } else {
            res.status(400).json({
                error: "Invalid user data"
            })
        }

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("Error in signupUser:", err.message);
    }

};


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

        await user.save();
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        });





    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in loginUser:", err.message);
    }


}

const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" })

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in loguotUser:", err.message);
    }
}

const followUnfollowUser = async (req, res) => {
    try {

        const { id } = req.params;

        const userToModify = await User.findById(id);

        const currentUser = await User.findById(req.user._id);
        console.log("trying")

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself!" })
        }
        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found!" });
        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            //Unfollow user from both user profiles
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json({ message: "User unfollowed successfully" });
        }
        else {
            //Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnfollowUser:", err.message);
    }
}


const updateUserProfile = async (req, res) => {
    const { name, email, username, password, profilePic, bio } = req.body;
    const userId = req.user._id;
    try {

        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found" });

        if (req.params.id !== userId.toString())
            return res.status(400).json({ error: "You cannot update other user's profile" });

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        user.name = name || user.name; //updating the user's name, either updated version or if its null keeping it as is
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        res.status(200).json({ message: "Profile updated successfully" });


    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in updateUserProfile:", err.message);
    }

}

const getUserProfile = async (req, res) => {

    //fetching profile with both username and userid 
    //can use this to log in with both username and email
    const { query } = req.params;


    try {
        let user;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUserProfile, getUserProfile };