const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// Limit to 5 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please try again later." },
});

router.use(authLimiter); // applies to all auth routes

// POST /register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
