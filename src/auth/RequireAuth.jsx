
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireAuth = () => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return null; // or spinner

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
