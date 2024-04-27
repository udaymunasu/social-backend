// routes/postRoutes.js

const express = require('express');
const Product = require('../models/article');
let fs = require("fs");

const router = express.Router();

router.post("/createPost", async (req, res) => {
    try {
        let body = req.body;
        let product = new Product();

        product.userId = body.userId;
        product.title = body.title;
        product.content = body.content;
        product.location = body.location;
        product.timestamp = body.timestamp;

        product.userImage = body.userImage;
        // console.log("product.imagepath", product)

        // if (base64image) {

        //     const randomname = (Math.random() + 1).toString(36).substring(7);
        //     const imageData = base64image.replace(/^data:image\/\w+;base64,/, '');
        //     const imageBuffer = Buffer.from(imageData, 'base64');
        //     product.userImage = `articles/${randomname}.jpg`;
        //     fs.writeFile(`assets/${product.userImage}`, imageBuffer, (err) => {
        //         if (err) {
        //             console.log('Error while saving image:', err);
        //             return res.status(500).json({ status: 'failed', data: 'Failed to save image' });
        //         }
        //     });
        // }
        product.save().then(result => {
            res.end(JSON.stringify({ status: "success", data: result }));
        }, err => {
            res.end(JSON.stringify({ status: "failed", data: err }));
        });
        console.log(product)

    }
    catch {
        res.end(JSON.stringify({ status: "failed", data: "Something went wrong" }));
    }
});

// Endpoint to get all posts
router.get('/posts', async (req, res) => {
    try {
        // Fetch all posts from your database
        const posts = await Product.find();

        // const usersWithImages = posts.map(user => {
        //     const userWithImage = user.toJSON();
        //     userWithImage.userImage = `http://localhost:3000/${user.userImage}`;
        //     return userWithImage;
        // });
        // res.json({ status: 'success', data: usersWithImages });
        res.json({ status: 'success', data: posts });
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching all posts' });
    }
});

// GET posts by userId
router.get('/posts/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Use Mongoose to find posts by userId
        const userPosts = await Product.find({ userId });

        const usersWithImages = userPosts.map(user => {
            const userWithImage = user.toJSON();
            userWithImage.userImage = `http://localhost:3000/${user.userImage}`;
            return userWithImage;
        });

        // Return the retrieved posts
        res.json(usersWithImages);
    } catch (error) {
        console.error('Error fetching posts by userId:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Route for liking a post
router.post('/posts/:postId/like', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id; // Assuming you have authentication middleware

    try {
        // Find the post by ID
        const post = await Product.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user has already liked the post
        if (post.likes.includes(userId)) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }

        // Add the user's ID to the likes array
        post.likes.push(userId);

        // Save the updated post
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Route for unliking a post
router.post('/posts/:postId/unlike', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.body.userId; // Get the user's ID from the request body

    try {
        // Find the post by ID
        const post = await Product.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user's ID is in the likes array
        if (!post.likes || !post.likes.includes(userId)) {
            return res.status(400).json({ error: 'You have not liked this post' });
        }

        // Remove the user's ID from the likes array
        post.likes = post.likes.filter((like) => like && like.toString() !== userId.toString());

        // Save the updated post
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Route for adding a comment to a post



// Define the POST route for creating comments
router.post('/posts/:postId/comment', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { userId, text } = req.body;

        // Validate the input data (e.g., postId, userId, text)

        // Find the post by postId
        const post = await Product.findById(postId);

        // console.log("comment", post)

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Create a new comment and add it to the post
        const newComment = {
            userId,
            text,
        };

        post.comments.push(newComment);

        // Save the updated post
        await post.save();

        console.log("comment", post)
        // Return a success response
        res.status(201).json({ message: 'Comment added successfully', data: post });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE a comment within a post by comment ID
router.delete('/posts/:postId/comment/:commentId', async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    try {
        // Find the post by ID
        const post = await Product.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Find the comment by ID within the comments array
        const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Remove the comment from the comments array
        post.comments.splice(commentIndex, 1);

        // Save the post to persist the changes
        await post.save();

        return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
