import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // assumes user model is converted to TS

const router = express.Router();

// Type definition for JWT payload
interface JwtPayload {
  userId: string;
}

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many requests, please try again later." },
});

router.use(authLimiter);

// POST /register
router.post("/register", async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
  }: { name?: string; email?: string; password?: string } = req.body;

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

    return res.status(201).json({ message: "User created successfully." });
  } catch (err: any) {
    console.error("Registration Error:", err.message);
    return res.status(500).json({ error: "Server error during registration." });
  }
});

// POST /login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password }: { email?: string; password?: string } = req.body;

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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({ token });
  } catch (err: any) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ error: "Server error during login." });
  }
});

export default router;
