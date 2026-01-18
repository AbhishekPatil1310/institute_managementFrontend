import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const ReceptionistLayout = () => {
  const { logout, user } = useAuth();
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
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-neutral-dark">
          <h1 className="text-2xl font-bold text-primary">
            Reception
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {user?.email}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to="/receptionist/dashboard" className={linkClass} end>
            Dashboard
          </NavLink>

          <NavLink to="/receptionist/students/search" className={linkClass}>
            Student Search
          </NavLink>

          <NavLink to="/receptionist/admissions" className={linkClass}>
            Admissions
          </NavLink>

          <NavLink to="/receptionist/payments" className={linkClass}>
            Payments
          </NavLink>

          <NavLink to="/receptionist/dues" className={linkClass}>
            Dues
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

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-neutral">
        <Outlet />
      </main>
    </div>
  );
};

export default ReceptionistLayout;
