import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

//Signup
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;            //validate email format
        //Check email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        //Check if username and email existed
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already taken" });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already taken" });
        }

        //Check password length is at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }
        //Hash password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object with validated and hashed data
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword      // Store the hashed password, not the plain text
        })

        //Save new user to database
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error signup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

//Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        //Find user by username
        const user = await User.findOne({ username });
        //Compare password with password hash
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        //Authentication failed
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        //Authentication success
        generateTokenAndSetCookie(user._id, res);
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })

    } catch (error) {
        console.log("Error login controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

//Logout
export const logout = async (req, res) => {
    try {
        //Clear the JWT cookie
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        console.log("Error logout controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

//Authentication
export const getMe = async (req, res) => {
    try {
        //Retrieve the current user's ID from the request object
        const userId = req.user._id;
        //Find the user by their ID, excluding the password field
        const user = await User.findById(userId).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};