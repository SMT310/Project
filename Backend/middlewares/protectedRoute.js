import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//Protect Routes Middleware
export const protectedRoute = async (req, res, next) => {
    try {
        //Extract jwt token from cookie
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        //Verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decode) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        //Find user associated with the token
        const user = await User.findById(decode.userId).select("-password");
        console.log(user);

        //Check if user existed
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error protectedRoute middleware", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};