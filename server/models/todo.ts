import mongoose, { Document, Schema, Model } from "mongoose";

// 1. Define the interface representing a Todo document
export interface ITodo extends Document {
  text: string;
  completed: boolean;
  completedAt?: Date | null;
  dueDate?: Date | null;
  priority: "low" | "medium" | "high";
  tags: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the schema
const todoSchema: Schema<ITodo> = new Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: { type: [String], default: [] },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 3. Export the model
const Todo: Model<ITodo> = mongoose.model<ITodo>("Todo", todoSchema);
export default Todo;
