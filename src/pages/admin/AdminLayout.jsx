import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const AdminLayout = () => {
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
            Admin Panel
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {user?.email}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass} end>
            Dashboard
          </NavLink>

          <NavLink to="/admin/batches" className={linkClass}>
            Batches
          </NavLink>

          <NavLink to="/admin/installments" className={linkClass}>
            Installments
          </NavLink>

          <NavLink to="/admin/references" className={linkClass}>
            References
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            Users
          </NavLink>

          <NavLink to="/admin/exams" className={linkClass}>
            Exams
          </NavLink>

          <NavLink to="/admin/attendance-qr" className={linkClass}>
            Attendance QR
          </NavLink>

          <div>
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-text-secondary uppercase">
              Reports
            </p>
            <NavLink
              to="/admin/reports/financial"
              className={linkClass}
            >
              Financial
            </NavLink>

            <NavLink
              to="/admin/reports/attendance"
              className={linkClass}
            >
              Attendance
            </NavLink>
          </div>
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-neutral">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
