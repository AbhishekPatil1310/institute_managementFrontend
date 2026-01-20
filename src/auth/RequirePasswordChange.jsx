<<<<<<< HEAD
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequirePasswordChange = ({ children }) => {
  const { user } = useAuth();

  if (
    user?.role === "STUDENT" &&
    user?.forcePasswordChange
  ) {
    return (
      <Navigate
        to="/student/profile/change-password"
        replace
      />
    );
  }

  return children;
};

export default RequirePasswordChange;
=======
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequirePasswordChange = ({ children }) => {
  const { user } = useAuth();

  if (
    user?.role === "STUDENT" &&
    user?.forcePasswordChange
  ) {
    return (
      <Navigate
        to="/student/profile/change-password"
        replace
      />
    );
  }

  return children;
};

export default RequirePasswordChange;
>>>>>>> master
