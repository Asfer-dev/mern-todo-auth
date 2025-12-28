import { ChangeEvent, FormEvent, useState } from "react";
import PrimaryButton from "./Button";
import Input from "./Input";

export type TodoFormData = {
  text: string;
  dueDate?: string | null;
  priority: "low" | "medium" | "high";
  tags?: string[];
};

type TodoFormProps = {
  todo: TodoFormData | null;
  onSubmit: (data: TodoFormData) => void | Promise<void>;
  onCancel: () => void;
};

const TodoForm = ({ todo, onSubmit, onCancel }: TodoFormProps) => {
  const [formData, setFormData] = useState({
    text: todo?.text || "",
    dueDate: todo?.dueDate
      ? new Date(todo.dueDate).toISOString().split("T")[0]
      : "",
    priority: todo?.priority || "medium",
    tags: todo?.tags?.join(", ") || "",
  });

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSubmit({
      ...formData,
      tags,
      dueDate: formData.dueDate || null,
    });
  };

  return (
    <form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Task Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">Task</label>
        <Input
          data-testid="todo-text"
          type="text"
          value={formData.text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("text", e.target.value)
          }
          placeholder="What needs to be done?"
          required
          className="w-full px-4 py-3 bg-white border-0 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-yellow-200 transition-all duration-200 outline-none"
        />
      </div>

      {/* Due Date Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          Due Date
        </label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("dueDate", e.target.value)
          }
        />
      </div>

      {/* Priority Select */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleChange("priority", e.target.value)
          }
          className="w-full px-4 py-3 bg-white border-0 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-yellow-200 transition-all duration-200 outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">Tags</label>
        <Input
          type="text"
          value={formData.tags}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("tags", e.target.value)
          }
          placeholder="work, urgent, home (comma separated)"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <PrimaryButton data-testid="todo-save" type="submit" className="w-full">
          {todo ? "Update" : "Create"} Task
        </PrimaryButton>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
