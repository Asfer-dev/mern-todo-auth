import express, { Request, Response } from "express";
import Todo from "../models/todo";
import auth from "../middleware/auth";

const router = express.Router();

// Middleware
router.use(auth);

// GET /api/todos - Get all todos
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a new todo
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, dueDate, priority = "medium", tags = [] } = req.body;
    const userId = (req as any).user.userId;

    if (!text) return res.status(400).json({ error: "Todo text required" });

    const todo = await Todo.create({
      text,
      dueDate,
      priority,
      tags,
      completed: false,
      userId,
    });

    res.status(201).json(todo);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PUT /api/todos/:id - Update a todo
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const update = { ...req.body };

    if (update.completed === true && !update.completedAt) {
      update.completedAt = new Date();
    } else if (update.completed === false) {
      update.completedAt = null;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId },
      update,
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// PATCH /api/todos/:id/toggle - Toggle completion
router.patch("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const todo = await Todo.findOne({ _id: req.params.id, userId });

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();

    res.json(todo);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});

// GET /api/todos/search - Filter todos
router.get("/search", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tag, priority, before, after } = req.query as {
      tag?: string;
      priority?: string;
      before?: string;
      after?: string;
    };

    const filter: any = { userId };

    if (tag) filter.tags = tag;
    if (priority) filter.priority = priority;
    if (before || after) filter.dueDate = {};
    if (before) filter.dueDate.$lte = new Date(before);
    if (after) filter.dueDate.$gte = new Date(after);

    const todos = await Todo.find(filter).sort({ dueDate: 1 });
    res.json(todos);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to search todos" });
  }
});

// DELETE /api/todos/completed - Bulk delete
router.delete("/completed", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const result = await Todo.deleteMany({ userId, completed: true });
    res.json({ deletedCount: result.deletedCount });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete completed todos" });
  }
});

// DELETE /api/todos/:id - Delete one
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const result = await Todo.deleteOne({ _id: req.params.id, userId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Todo not found or already deleted" });
    }

    res.json({ message: "Todo deleted" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
