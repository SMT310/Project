import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.get("/update", protectedRoute, updateUserProfile);


export default router;
