const mongoose = require("mongoose");
const Posts = require("../models/post");
const UserModel = require("../models/user");

exports.login = async (req, res, next) => {
    try {
        const { content, postId, tag, reply, postUserId } = req.body;

        const post = await Posts.findById(postId);

        if (!post) return res.status(400).json({ msg: "no post found" });

        const newComment = await new Comments({
            user: req.user._id,
            content,
            tag,
            reply,
            postUserId,
            postId,
        });

        await Posts.findOneAndUpdate(
            { _id: postId },
            {
                $push: { commentss: newComment._id },
            }
        );

        await newComment.save();
        return res.json({ newComment });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

// exports.login = async (req, res, next) => {

// }

// exports.login = async (req, res, next) => {

// }
