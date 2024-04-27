// controllers/userController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

//Files management
var fs = require("fs");
var path = require("path");

async function getAllUsers(req, res) {
  let users = await User.find();
  try {
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc
      return otherDetails
    })
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

async function getUser(req, res) {
  const id = req.params.id;
  try {
    const user = await User.findById(id);

    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).send({ message: "User Created", user: otherDetails });
    } else {
      res.status(404).json({ message: "No Such User" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Request error" });
  }
}

async function updateUser(req, res) {
  const id = req.params.id;
  // console.log("Data Received", req.body)
  const { _id, currentUserAdmin, password } = req.body;

  if (id === _id) {
    try {
      // if we also have to update password then password will be bcrypted again
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      // have to change this
      const user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_KEY || "MERN",
        { expiresIn: "1h" }
      );
      console.log({ user, token })
      res.status(200).json({ user, token });
    } catch (error) {
      console.log("Error agya hy", error)
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("Access Denied! You can update only your own Account.");
  }
};

async function deleteUser(req, res) {
  const id = req.params.id;
  const { currentUser, currentUserAdminStatus } = req.body;

  if (currentUser === id || currentUserAdminStatus) {
    try {
      await User.findByIdAndDelete(id);
      res.status(200).send({ message: "User Deleted Succesfully" });
    } catch (error) {
      res.status(500).send({ message: "Request error", error });
    }
  } else {
    res.status(403).send({
      message: "ACCESS DENIED! You can only update your own Profile.",
    });
  }
}

async function followUser(req, res) {
  const id = req.params.id;
  const { _id } = req.body;
  if (_id == id) {
    res.status(403).json("Action Forbidden.");
  } else {
    try {
      const followUser = await User.findById(id);
      const followingUser = await User.findById(_id);

      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json({Msg: "User followed!", followUser});
      } else {
        res.status(403).json("you are already following this id");
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
    }
  }
}


async function unfollowUser(req, res) {
  const id = req.params.id;
  const { _id } = req.body;

  if(_id === id)
  {
    res.status(403).json("Action Forbidden")
  }
  else{
    try {
      const unFollowUser = await User.findById(id)
      const unFollowingUser = await User.findById(_id)


      if (unFollowUser.followers.includes(_id))
      {
        await unFollowUser.updateOne({$pull : {followers: _id}})
        await unFollowingUser.updateOne({$pull : {following: id}})
        res.status(200).json({message:"Unfollowed Successfully!",unFollowUser})
      }
      else{
        res.status(403).json("You are not following this User")
      }
    } catch (error) {
      res.status(500).json(error)
    }
  }
}

//SAVE USER
async function saveUser(req, res) {
  try {
    const params = req.body;
    const user = new User();

    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;

    console.log("users", user);

    const existingUser = await User.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { nick: user.nick.toLowerCase() },
      ],
    });

    if (existingUser) {
      return res.status(200).send({
        message: "The user already exists. Try another nickname or email.",
      });
    }

    const hash = await bcrypt.hash(params.password, 10);
    user.password = hash;

    const userStored = await user.save();

    if (userStored) {
      return res.status(200).send({ user: userStored });
    } else {
      return res.status(404).send({ message: "User not saved" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Error in the request" });
  }
}

async function loginUser(req, res) {
  try {
    const params = req.body;
    const email = params.email;
    const password = params.password;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "The user doesn´t exist" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      if (params.gettoken) {
        // Return Token
        const token = jwt.createToken(user);
        return res.status(200).send({ token });
      } else {
        // SECURITY MEASURE: DO NOT SEND USER PASSWORDS
        user.password = undefined;
        return res.status(200).send({ user });
      }
    } else {
      // The password is incorrect
      return res.status(404).send({ message: "The password doesn´t match" });
    }
  } catch (error) {
    return res.status(500).send({ message: "An error has occurred" });
  }
}

module.exports = {
  saveUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getAllUsers
};
