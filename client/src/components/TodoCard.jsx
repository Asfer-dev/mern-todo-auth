import { Calendar, Check, Edit3, Star, Trash2 } from "lucide-react";

const TodoCard = ({ todo, onToggle, onEdit, onDelete }) => {
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBorderColor = () => {
    if (todo.completed) return "border-l-green-400";
    if (isOverdue) return "border-l-red-400";

    switch (todo.priority) {
      case "high":
        return "border-l-red-400";
      case "medium":
        return "border-l-yellow-400";
      case "low":
        return "border-l-green-400";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border-l-4 ${getBorderColor()} ${
        todo.completed ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggle(todo._id)}
            className={`mt-1 p-1.5 rounded-full transition-all duration-200 ${
              todo.completed
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 hover:bg-yellow-100 hover:shadow-sm"
            }`}
          >
            <Check size={14} />
          </button>

          <div className="flex-1">
            <p
              className={`font-medium text-sm ${
                todo.completed ? "line-through text-gray-500" : "text-gray-800"
              }`}
            >
              {todo.text}
            </p>

            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {todo.dueDate && (
                <div
                  className={`flex items-center space-x-1 ${
                    isOverdue ? "text-red-600" : ""
                  }`}
                >
                  <Calendar size={12} />
                  <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {todo.priority && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    todo.priority
                  )}`}
                >
                  <Star size={10} />
                  <span className="capitalize">{todo.priority}</span>
                </div>
              )}
            </div>

            {todo.tags && todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {todo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-50 text-gray-600 text-xs rounded-full border border-yellow-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-1 ml-4">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(todo._id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
