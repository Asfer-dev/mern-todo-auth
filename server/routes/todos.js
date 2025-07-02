const express = require("express");
const Todo = require("../models/todo");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

// GET /api/todos - Get all todos for user
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a new todo
router.post("/", async (req, res) => {
  try {
    const { text, dueDate, priority = "medium", tags = [] } = req.body;

    if (!text) return res.status(400).json({ error: "Todo text required" });

    const todo = await Todo.create({
      text,
      dueDate,
      priority,
      tags,
      completed: false,
      userId: req.user.userId,
    });

    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT /api/todos/:id - Update a todo (any field)
router.put("/:id", async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.completed === true && !update.completedAt) {
      update.completedAt = new Date();
    } else if (update.completed === false) {
      update.completedAt = null;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// PATCH /api/todos/:id/toggle - Toggle completed state
router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});

// GET /api/todos/search - Search/filter todos
router.get("/search", async (req, res) => {
  try {
    const { tag, priority, before, after } = req.query;

    const filter = { userId: req.user.userId };

    if (tag) filter.tags = tag;
    if (priority) filter.priority = priority;
    if (before || after) filter.dueDate = {};
    if (before) filter.dueDate.$lte = new Date(before);
    if (after) filter.dueDate.$gte = new Date(after);

    const todos = await Todo.find(filter).sort({ dueDate: 1 });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search todos" });
  }
});

// DELETE /api/todos/completed - Bulk delete completed todos
router.delete("/completed", async (req, res) => {
  try {
    const result = await Todo.deleteMany({
      userId: req.user.userId,
      completed: true,
    });

    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete completed todos" });
  }
});

// DELETE /api/todos/:id - Delete a single todo
router.delete("/:id", async (req, res) => {
  try {
    const result = await Todo.deleteOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Todo not found or already deleted" });
    }

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = router;
