import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";

dotenv.config();

const app: Application = express();

// --- Middleware ---
const isProd = process.env.NODE_ENV === "production";
const DEV_ORIGIN = "http://localhost:5173";
app.use(cors({ origin: isProd ? true : DEV_ORIGIN }));
app.use(express.json());

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Serve Vite build in prod OR when dist exists (so EB works, local dev unaffected) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// at runtime this file is in server/dist → go up to repo root → client/dist
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
const hasBuiltClient = fs.existsSync(path.join(clientDist, "index.html"));

if (isProd || hasBuiltClient) {
  app.use(express.static(clientDist));
  // SPA fallback (but don't swallow API)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// --- Mongo + start ---
const PORT: number = Number(process.env.PORT) || 5000; // EB sets PORT
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("MONGO_URI not provided in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
