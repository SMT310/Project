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
        if (!text && (!img || (Array.isArray(img) && img.length === 0))) {
            return res.status(400).json({ error: "Post must have text or image" });
        }
        // Ensure img is always an array, even if it's a single image
        const imagesArray = Array.isArray(img) ? img : img ? [img] : [];

        // Image upload handling
        const imgUrls = await Promise.all(
            imagesArray.map(async (image) => {
                const uploadResult = await cloudinary.uploader.upload(image);
                return uploadResult.secure_url;
            })
        );

        //Create a new Post
        const newPost = new Post({
            user: userId,
            text,
            img: imgUrls.length > 0 ? imgUrls : undefined
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

            // Remove the existing like notification
            await Notification.deleteOne({
                from: userId,
                to: post.user,
                type: "like",
                post: postId, // Use `post` field here instead of `postId`
            });
            
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        } else {
            //Like post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();

            // const notification = new Notification({
            //     from: userId,
            //     to: post.user,
            //     type: "like"
            // })
            // await notification.save();

            // Check if a notification already exists to prevent duplicates
            const existingNotification = await Notification.findOne({ from: userId, to: post.user, type: "like", postId });
            if (!existingNotification) {
                // Create a new like notification if one does not already exist
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like",
                    post: postId,
                });
                await notification.save();
            }

            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
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

        const updatedComments = post.comments;
        res.status(200).json(updatedComments);
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

//Edit comment
export const editComment = async (req, res) => {
    try {
        const { text, img } = req.body; // New text or image for the comment
        const postId = req.params.postId; // Post ID
        const commentId = req.params.commentId; // Comment ID
        const userId = req.user._id.toString(); // Authenticated user's ID

        if (!text && !img) {
            return res.status(400).json({ error: "Comment must have either text or an image" });
        }

        // Find the post by its ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Find the specific comment by ID
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Ensure the user is authorized to edit the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to edit this comment" });
        }

        // Update the text or image
        comment.text = text || comment.text; // Update the text if provided
        if (img) {
            // Handle image upload if a new image is provided
            const uploadResponse = await cloudinary.uploader.upload(img, {
                resource_type: 'auto',
            });
            comment.img = uploadResponse.secure_url; // Update the image URL
        }

        // Save the updated post document
        await post.save();

        // Respond with the updated comments array
        res.status(200).json(post.comments);
    } catch (error) {
        console.error("Error in editComment controller:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        // const post = await Post.findById(postId);
        // if (!post) return res.status(404).json({ error: "Post not found" });

        // // Ensure the comment belongs to the authenticated user
        // const commentIndex = post.comments.findIndex(
        //     (c) => c._id.toString() === commentId && c.user.toString() === req.user._id
        // );

        // if (commentIndex === -1) {
        //     return res.status(403).json({ error: "Unauthorized" });
        // }

        // // Remove the comment
        // post.comments.splice(commentIndex, 1);
        // await post.save();

        // res.json(post.comments);
        // Find the post by postId
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Ensure the comment belongs to the authenticated user
        const comment = post.comments.find(c => c._id.toString() === commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // Check if the authenticated user is the owner of the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Remove the comment from the post
        post.comments = post.comments.filter(c => c._id.toString() !== commentId);
        await post.save();

        res.json({ message: "Comment deleted successfully", comments: post.comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
