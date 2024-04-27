var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const PostsSchema = Schema(
  {
    userId: String,
    desc: String,
    likes: [],
    image: String,
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    //The type is an ObjectId, because is the reference to the User Id, and the reference is to User
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Posts", PostsSchema);
