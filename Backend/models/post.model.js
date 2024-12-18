import mongoose, { mongo } from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String
    },
    img: {
        type: [String],
        default: undefined
    },
    likes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }
    ],
    comments: [{
        text: {
            type: String,
            required: true
        },
        img: {
            type: String,
            default: ""
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }]
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;