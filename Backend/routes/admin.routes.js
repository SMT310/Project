import express from "express";

import { protectedRoute } from "../middlewares/protectedRoute.js";
import { createAccount, deletePost, deleteUser, getAllPostAdmin, getAllUser } from "../controllers/admin.controllers.js";

const router = express.Router();

router.post("/createAccount", createAccount);
router.post("/getAllUser", protectedRoute, getAllUser);
router.get("/getAllPostAdmin", protectedRoute, getAllPostAdmin);
router.delete("/:id", protectedRoute, deleteUser);
router.delete("/deletePostAdmin/:id", protectedRoute, deletePost);

export default router;