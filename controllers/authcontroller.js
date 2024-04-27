const User = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPass
  const newUser = new User(req.body);
  const { username, email } = req.body

  try {
    // addition new
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // changed
    const user = await newUser.save();
    const token = jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_KEY || "MERN",
      { expiresIn: "1h" }
    );
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.login = async (req, res, next) => {

  const { username, password, email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      var validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        res.status(400).json("wrong password");
      } else {
        const token = jwt.sign(
          { username: user.username, id: user._id },
          process.env.JWT_KEY || "MERN",
          { expiresIn: "1h" }
        );
        res.status(200).json({ user, token });
      }
    } else {
      res.status(404).json("User not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }

}




