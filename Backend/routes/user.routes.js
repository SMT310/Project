import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
    followUnfollowUser,
    getSuggestedUsers,
    getUserProfile,
    updateUserProfile,
    searchUser,
    getAllUser
} from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/search", protectedRoute, searchUser);
router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/getAllUser", protectedRoute, getAllUser);
router.post("/update", protectedRoute, updateUserProfile);

export default router;
