import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import TodoCard from "../components/TodoCard";
import TodoForm from "../components/TodoForm";
import Modal from "../components/Modal";
import GradientButton from "../components/Button";
import {
  LogOut,
  Plus,
  Search,
  Calendar,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import PrimaryButton from "../components/Button";

const Dashboard = () => {
  const { logout } = useAuth();
  const { apiCall } = useApi();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Fetch todos from backend
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall("/todos");
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const openModal = (todo = null) => {
    setEditingTodo(todo);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingTodo(null);
    setShowModal(false);
  };

  const handleCreateOrUpdate = async (data) => {
    const method = editingTodo ? "PUT" : "POST";
    const endpoint = editingTodo ? `/todos/${editingTodo._id}` : "/todos";

    try {
      await apiCall(endpoint, {
        method,
        body: JSON.stringify(data),
      });
      closeModal();
      fetchTodos();
    } catch (err) {
      console.error("Failed to save todo:", err);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      await apiCall(`/todos/${id}/toggle`, { method: "PATCH" });
      fetchTodos();
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await apiCall(`/todos/${id}`, { method: "DELETE" });
        fetchTodos();
      } catch (err) {
        console.error("Failed to delete todo:", err);
      }
    }
  };

  const handleDeleteCompleted = async () => {
    if (window.confirm("Delete all completed tasks?")) {
      try {
        await apiCall("/todos/completed", { method: "DELETE" });
        fetchTodos();
      } catch (err) {
        console.error("Failed to delete completed todos:", err);
      }
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesPriority =
        !filterPriority || todo.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [todos, searchTerm, filterPriority]);

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    overdue: todos.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length,
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={fetchTodos}
            className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">Notes</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>{stats.total} total</span>
              <span>{stats.completed} done</span>
              {stats.overdue > 0 && (
                <span className="text-yellow-600">{stats.overdue} overdue</span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<Clock />}
            color="bg-gray-500"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<Check />}
            color="bg-green-500"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle />}
            color="bg-red-500"
          />
        </div> */}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-yellow-200 transition-all duration-200 outline-none"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 bg-white border-0 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-yellow-200 transition-all duration-200 outline-none"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            {stats.completed > 0 && (
              <button
                onClick={handleDeleteCompleted}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
          <PrimaryButton
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg transition-colors shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={18} />
            <span>New note</span>
          </PrimaryButton>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm || filterPriority
                  ? "No notes found"
                  : "No notes yet"}
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterPriority
                  ? "Try adjusting your search"
                  : "Create your first note to get started"}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onToggle={handleToggleTodo}
                onEdit={() => openModal(todo)}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title={editingTodo ? "Edit note" : "New note"}
          >
            <TodoForm
              todo={editingTodo}
              onSubmit={handleCreateOrUpdate}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// StatCard subcomponent
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
