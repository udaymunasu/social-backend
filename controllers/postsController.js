// controllers/postController.js
const mongoose = require("mongoose");
const Post = require('../models/post');
const UserModel = require('../models/user');


// Create a Post
async function createPost(req, res) {
  const newPost = new Post(req.body);
  const authorId = req.userId; // Assuming you have middleware to set userId
  try {
    await newPost.save();
    console.log(newPost)
    res.status(201).json({ message: "Post Created!", post: newPost });
  } catch (error) {
    res.status(500).json({ error: 'Error Creating post' });
  }
}

async function getPost(req, res) {
  const id = req.params.id;
  try {
    const post = await Post.findById(id);
    res.status(201).json({ message: "Post Found", post: post });
  } catch (error) {
    res.status(500).json({ error: 'Error getting post' });
  }
}


async function updatePost(req, res) {
  const postId = req.params.id;
  const { userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body })
      res.status(200).json({ message: "Post Updated", post: post });

    } else {
      res.status(403).json({ message: "Action Forbidden" });

    }
  } catch (error) {
    res.status(500).json({ error: 'Error getting post' });
  }
}

async function deletePost(req, res) {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json({ message: 'Post Deleted Succesfully' });
    } else {
      res.status(403).json({ message: 'Action forbidden' });

    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
}

async function likePost(req, res) {
  const id = req.params.id;
  const { userId } = req.body;

  try {

    const post = await Post.findById(id);

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } })
      res.status(200).json({ message: 'Post Liked Succesfully' });
    } else {
      await post.updateOne({ $pull: { likes: userId } })
      res.status(200).json({ message: 'Post Un liked Succesfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error liking post' });
  }
}

// Get timeline posts include post of his own and post of person he is folowing

async function getTimeLinePosts(req, res) {
  const userId = req.params.id;

  try {
    // console.log("userId", userId)
    const currentUserPosts = await Post.find({ userId: userId });

    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: "following",
          foreignField: "userId",
          as: "followingPosts"
        }
      }, {
        $project: {
          followingPosts: 1,
          _id: 0
        }
      }
    ])

    const fetchedPosts = currentUserPosts.concat(...followingPosts[0].followingPosts).sort((a, b) => {
      return b.createdAt - a.createdAt;
    })
    // console.log("followingPosts", followingPosts)

    res.status(200).json({ message: 'Post Fetching Successfully', posts: fetchedPosts })

  } catch (error) {
    res.status(500).json({ error: 'Error getting posts' });
  }
}




module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getTimeLinePosts
};
