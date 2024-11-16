import Post from "../models/post.model.js";

export const GetAllPostAdmin = async (req, res) => {
    try {
        const pageNo = 1;
        const postLimit = 5;
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        })
            .populate({
                path: "comments.user",
                select: "-password"
            });
        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error getAllPost controller", error.message);
        res.status(500).json({ error: error.message });
    }
}