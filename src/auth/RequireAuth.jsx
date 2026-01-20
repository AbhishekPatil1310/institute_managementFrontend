<<<<<<< HEAD
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireAuth = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null; // or spinner

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
=======
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireAuth = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null; // or spinner

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
>>>>>>> master
