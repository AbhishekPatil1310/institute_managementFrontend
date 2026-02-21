
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const Menu = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-neutral">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg w-64 fixed top-0 left-0 h-full z-50 transform flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0`}
      >
        <div className="p-6 border-b border-neutral-dark flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <button onClick={toggleSidebar} className="md:hidden">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-text-secondary mt-1 px-6">{user?.email}</p>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto min-h-0">
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
          <div>
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-text-secondary uppercase">
              Reports
            </p>
            <NavLink to="/admin/reports/financial" className={linkClass}>
              Financial
            </NavLink>
            <NavLink to="/admin/reports/attendance" className={linkClass}>
              Attendance
            </NavLink>
            <NavLink to="/admin/notes" className={linkClass}>
              Notes
            </NavLink>
            <NavLink to="/admin/reports/download" className={linkClass}>
              Report Download
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-dark shrink-0">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 md:hidden flex justify-between items-center bg-white shadow-md">
          <button onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </header>
        <main className="flex-1 p-8 overflow-y-auto md:ml-64">
          <Outlet />
        </main>
      </div>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
