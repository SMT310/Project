import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";


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
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            //Dislike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            res.status(200).json({ message: "Post dislike successfully" });
        } else {
            //Like post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();

            res.status(200).json({ message: "Post like successfully" });
        }

    } catch (error) {
        console.log("Error likeDislikePost controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getAllPost = async (req, res) => {
    try {
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

export const commentPost = async (req, res) => {
    try {
        const { text, img } = req.body;
        const postId = req.params.id;
        const userId = req.user._id.toString();
        if (!text && !img) {
            return res.status(400).json({ error: "Comment must have either text or an image" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        let imageUrl = '';
        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img, {
                resource_type: 'auto' // Automatically detects image/video type
            });

            imageUrl = uploadResponse.secure_url;  // The URL of the uploaded image
        }

        const comment = { user: userId, text, img: imageUrl };
        post.comments.push(comment);
        await post.save();

        const notification = new Notification({
            from: userId,
            to: post.user,
            type: "comment"
        })
        await notification.save();

        res.status(200).json(post);
    } catch (error) {
        console.log("Error commentPost controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error getLikedPosts controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error getFollowingPosts controller", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error getUserPosts controller", error.message);
        res.status(500).json({ error: error.message });
    }
};