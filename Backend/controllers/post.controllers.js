import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!text && !img) {
            return res.status(400).json({ error: "Post must have text or image" });
        }
        if (img) {
            const uploadResult = await cloudinary.uploader.upload(img);
            img = uploadResult.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text, 
            img
        })

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log("Error createPost controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const likeDislikePost = async (req, res) => {

};

export const commentPost = async (req, res) => {

};

export const deletePost = async (req, res) => {

};