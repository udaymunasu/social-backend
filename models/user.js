const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    password: String, // In a real application, use a proper password hashing library
    location: String,
    mobile: Number,
    dob: String,
    age: String,
    profilePicture: String,
    coverPicture: String,
    about: String, // Base64 encoded profile picture
    livesin: String,
    worksat: String,
    relationship: String,
    followers: [],
    following: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);