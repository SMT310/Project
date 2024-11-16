import express from "express";

import { protectedRoute } from "../middlewares/protectedRoute.js";
import { GetAllPostAdmin } from "../controllers/admin.controllers.js";

const router = express.Router();

router.get("/getAllPostAdmin", protectedRoute, GetAllPostAdmin);

export default router;