import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RequirePasswordChange = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const changePasswordPath = "/student/profile/change-password";
  const onChangePasswordPage = location.pathname === changePasswordPath;

  if (
    user?.role === "STUDENT" &&
    user?.forcePasswordChange &&
    !onChangePasswordPage
  ) {
    return (
      <Navigate
        to={changePasswordPath}
        replace
      />
    );
  }

  return children;
};

export default RequirePasswordChange;
