import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";

type FormData = {
  email: string;
  password: string;
};

type ErrorState = {
  email?: string;
  password?: string;
  general?: string;
};

const LoginPage = () => {
  const { login } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange =
    (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleSubmit = async () => {
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ general: "All fields are required" });
      return;
    }

    setLoading(true);

    try {
      const data = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      login(data.token);
      navigate("/dashboard");
    } catch (error: any) {
      setErrors({ general: error.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-800 mb-2">
            Welcome Back to To-Do App abcd
          </h1>
          <p className="text-gray-500">Sign in to your account</p>
          <div className="bg-amber-100 rounded-lg p-2 mt-2">
            <p className="text-yellow-700">Test Account</p>
            <p className="text-yellow-700">email: test@gmail.com</p>
            <p className="text-yellow-700">password: test123</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            {/* <label className="block text-sm font-medium text-gray-600">
              Email
            </label> */}
            <Input
              label={"Email"}
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="Enter your email"
              error={errors.email}
              disabled={loading}
              data-testid="login-email"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            {/* <label className="block text-sm font-medium text-gray-600">
              Password
            </label> */}
            <Input
              label={"Password"}
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Enter your password"
              error={errors.password}
              disabled={loading}
              data-testid="login-password"
            />
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="w-full"
            data-testid="login-submit"
          >
            {loading ? "Please wait..." : "Sign In"}
          </PrimaryButton>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading}
            data-testid="go-register"
          >
            {"Don't have an account? "}
            <span className="text-yellow-600 hover:text-yellow-700">
              Sign up
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
