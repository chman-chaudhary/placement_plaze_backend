// /routes/auth.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const upload = require("../middleware/upload");

const router = express.Router();

// Sign-Up
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { email, password } = req.body;
  const profileImage = req.file ? req.file.path : null;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, profileImage });
    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        profileImage: newUser.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({
      token,
      user: { id: newUser._id, email: newUser.email, profileImage },
    });
  } catch (err) {
    res.status(500).json({ message: "Error during signup" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, profileImage: user.profileImage },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error during login" });
  }
});

module.exports = router;
