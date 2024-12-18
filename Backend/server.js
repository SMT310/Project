import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notificationRoutes.routes.js";
import adminRoute from "./routes/admin.routes.js";


import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

const port = process.env.PORT || 8000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: "true" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/admin', adminRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/Frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
    })
}

app.listen(port, () => {
    console.log(`Server is running on: ${port}`);
    connectMongoDB();
});