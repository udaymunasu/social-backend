// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  title: String,
  content: String,
  location: String,
  userImage: String,
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked the post
  unlikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who unliked the post
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who commented
    text: String,
  }],
});

module.exports = mongoose.model('Post', postSchema);
