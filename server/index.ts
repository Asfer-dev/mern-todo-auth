import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import mongoose from "mongoose";

// Import route modules (assume they are converted to TypeScript too)
import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todos";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// MongoDB connection
const PORT: number = parseInt(process.env.PORT ?? "5000", 10);
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("MONGO_URI not provided in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
