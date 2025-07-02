// components/RedirectHome.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectHome = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default RedirectHome;
