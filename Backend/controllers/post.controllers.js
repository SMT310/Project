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

        //Image Upload Handling (using Cloudinary for storage)
        if (img) {
            const uploadResult = await cloudinary.uploader.upload(img);
            img = uploadResult.secure_url;
        }

        //Create a new Post
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
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        //Check authorization for post deletion
        if (post.user.toString() !== req.user._id.toString()) {
            console.log(post.user.toString());
            console.log(post.user.toString());

            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        //Delete image from Cloudinary (if the post has an image)
        if (post.img) {
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }

        //Delete the post from the database
        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post delete successfully" });
    } catch (error) {
        console.log("Error deletePost controller", error.message);
        res.status(500).json({ error: error.message });
    }
};