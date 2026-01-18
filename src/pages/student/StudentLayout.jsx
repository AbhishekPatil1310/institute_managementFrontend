import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-primary text-white"
        : "text-text-secondary hover:bg-neutral-dark hover:text-text-primary"
    }`;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-neutral-dark">
          <h1 className="text-2xl font-bold text-primary">
            Student Portal
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {user?.name}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink
            to="/student/dashboard"
            className={linkClass}
            end
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/student/attendance/scan"
            className={linkClass}
          >
            Attendance
          </NavLink>

          <NavLink
            to="/student/exams"
            className={linkClass}
          >
            Exams
          </NavLink>

          <NavLink
            to="/student/profile"
            className={linkClass}
          >
            Profile
          </NavLink>
        </nav>
        <div className="p-4 absolute bottom-0 w-64">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-neutral">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;

