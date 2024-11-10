import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { createPost } from "../controllers/post.controllers.js";

const router = express.Router();

router.post("/create", protectedRoute, createPost);
// router.post("/like/:id", protectedRoute, likeDislikePost);
// router.post("/comment/:id", protectedRoute, commentPost);
router.delete("/", protectedRoute, deletePost);


export default router;