import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

//Get User Profile
export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", user: null });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error getUserProfile controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Follow & Unfollow User
export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        //Find user to modify and current user
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        //Check self follow
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/ unfollow yourself" });
        }
        //Check if user existed
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" });
        }

        //Check if follow or unfollow
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            //Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            await Notification.deleteOne({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id,
            });

            const updatedUser = await User.findById(req.user._id);
            //Send notification to user
            const updatedComments = userToModify.followers.filter((id) => id.toString() !== req.user._id.toString());
            res.status(200).json({
                updatedUser,
                updatedComments
            });
        } else {
            //Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            // Check if follow notification already exists
            const existingNotification = await Notification.findOne({
                from: req.user._id,
                to: userToModify._id,
                type: 'follow',
            });

            // Only create a new notification if it doesn't exist
            if (!existingNotification) {
                const newNotification = new Notification({
                    from: req.user._id,
                    to: userToModify._id,
                    type: 'follow',
                });
                await newNotification.save();
            }

            const updatedUser = await User.findById(req.user._id);
            const updatedComments = userToModify._id
            res.status(200).json({
                updatedUser,
                updatedComments
            });
        }
    } catch (error) {
        console.log("Error followUnfollowUser controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Suggested User
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        //Find users which current user is following
        const usersFollowedByMe = await User.findById(userId).select("following");
        //Find 10 random users excluding the current user
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                    role: { $ne: "admin" }//Exclude the current user
                }
            },
            {
                $sample: {
                    size: 10                //Randomly select 10 users
                }
            }
        ])

        //Filter out users the current user is already following
        const filterUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUser = filterUsers.slice(0, 4);
        suggestedUser.forEach((user) => (user.password == null));

        res.status(200).json(suggestedUser);
    } catch (error) {
        console.log("Error getSuggestedUsers controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Update User Profile
export const updateUserProfile = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Password update validation
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide current password and new password" });
        }
        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        //Profile Image Handling(using Cloudinary for storage)
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResult = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResult.secure_url;
        }
        //Cover Image Handling (using Cloudinary for storage)
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResult = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResult.secure_url;
        }

        //Update User Profile Fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        // password should be null in response
        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error updateUserProfile controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Search User
export const searchUser = async (req, res) => {
    const { query } = req.query; // The search query from the request

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        const regex = new RegExp(query, "i"); // Create a case-insensitive regex

        // Search users by username, fullName, or email
        const users = await User.find({
            $or: [
                { username: { $regex: regex } },
                { fullName: { $regex: regex } },
                // { email: { $regex: regex } },
            ],
        }).select("-password"); // Exclude the password from the result

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.log("Error searchUser controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

//Get All User
export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUser controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}