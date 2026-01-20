<<<<<<< HEAD
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireRole = ({ role, children }) => {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
=======
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequireRole = ({ role, children }) => {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
>>>>>>> master
