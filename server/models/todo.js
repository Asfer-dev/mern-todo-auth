const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
