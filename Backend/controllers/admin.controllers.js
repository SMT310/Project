import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";

export const getAllPostAdmin = async (req, res) => {
    try {
        const pageNo = 1;
        const postLimit = 5;
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        })
            .populate({
                path: "comments.user",
                select: "-password"
            });
        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error getAllPost controller", error.message);
        res.status(500).json({ error: error.message });
    }
}

//Get All User
export const getAllUser = async (req, res) => {
    try {
        const currentUserId = await User.findById(req.user._id);
        const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUser controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Delete User
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 1. Remove the user from followers and following lists of other users
        await User.updateMany(
            { $or: [{ followers: userId }, { following: userId }] },
            { $pull: { followers: userId, following: userId } }
        );

        // 2. Handle posts by the user
        await Post.deleteMany({ user: userId });

        // 3. Remove likes and comments by the user from posts
        await Post.updateMany(
            { likes: userId },
            { $pull: { likes: userId } }
        );
        await Post.updateMany(
            { "comments.user": userId },
            { $pull: { comments: { user: userId } } }
        );


        // 4. Delete notifications related to the user
        await Notification.deleteMany({ $or: [{ from: userId }, { to: userId }] });

        // 5. Delete the user
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User delete successfully" });
    } catch (error) {
        console.log("Error deleteUser controller", error.message);
        res.status(500).json({ error: error.message });
    }
}

//Create Account
export const createAccount = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        const { role = "user" } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;            //validate email format
        //Check email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        //Check if username and email existed
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already taken" });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already taken" });
        }

        //Check password length is at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }
        //Hash password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object with validated and hashed data
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,      // Store the hashed password, not the plain text
            role
        })

        //Save new user to database
        if (newUser) {
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                role: newUser.role
            })
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error signup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

//Delete post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        //Check authorization for post deletion
        // if (post.user.toString() !== req.user._id.toString()) {
        if (req.user.role === "user") {
            console.log(post.user.toString());
            console.log("role:", req.user.role);
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        // Delete images from Cloudinary if the post has any images
        if (Array.isArray(post.img)) {
            // Handle multiple images
            const deletePromises = post.img.map(imageUrl => {
                const publicId = imageUrl.split("/").pop().split(".")[0];
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
        } else if (post.img) {
            // Handle single image case (if img was a string)
            const publicId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        //Delete the post from the database
        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post delete successfully" });
    } catch (error) {
        console.log("Error deletePost controller", error.message);
        res.status(500).json({ error: error.message });
    }
}