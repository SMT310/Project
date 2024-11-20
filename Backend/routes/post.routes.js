import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
    createPost,
    deletePost,
    likeDislikePost,
    getAllPost,
    commentPost,
    getLikedPosts,
    getFollowingPosts,
    getUserPosts,
    editComment,
    deleteComment
} from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPost);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/likes/:id", protectedRoute, getLikedPosts);
router.get("/user/:username", protectedRoute, getUserPosts);
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, likeDislikePost);
router.post("/comment/:id", protectedRoute, commentPost);
router.put("/:postId/comments/:commentId", protectedRoute, editComment);
router.delete("/:postId/deleteComments/:commentId", protectedRoute, deleteComment);
router.delete("/:id", protectedRoute, deletePost);

export default router;