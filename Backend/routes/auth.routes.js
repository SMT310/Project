import express from "express";
import { getMe, getUserCountForYear, login, logout, signup } from "../controllers/auth.controllers.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.get("/me", protectedRoute, getMe);
router.post("/signup", signup);
router.post("/countUser", getUserCountForYear);
router.post("/login", login);
router.post("/logout", logout);

export default router;