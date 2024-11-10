import jwt from "jsonwebtoken";

//Generate Token
export const generateTokenAndSetCookie = (userId, res) => {
    // Generate a JWT token with the user's ID and a 15-day expiration time
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: `15d` }
    )
    // Set the JWT token as an HTTP-only cookie
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    })
}