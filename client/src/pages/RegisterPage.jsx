import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import Input from "../components/Input";
import PrimaryButton from "../components/Button";

const RegisterPage = () => {
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // local state

  const handleSubmit = async () => {
    setErrors({});
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setErrors({ general: "All fields are required" });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);

    try {
      await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrors({ general: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-8 w-full max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-800 mb-2">
              Join To-Do App
            </h1>
            <p className="text-gray-500">Create your account</p>
          </div>

          <div className="space-y-6">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password (min 6 characters)"
              error={errors.password}
              disabled={loading}
            />

            {errors.general && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : "Sign Up"}
            </PrimaryButton>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            disabled={loading}
          >
            Already have an account?{" "}
            <span className="text-yellow-600 hover:text-yellow-700">
              Sign in
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
