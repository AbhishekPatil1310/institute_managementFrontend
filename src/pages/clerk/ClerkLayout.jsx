import { Outlet, useNavigate, NavLink } from "react-router-dom";

const ClerkLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg leading-tight">Sharda Academy</h1>
            <p className="text-xs opacity-80">Attendance Desk</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-sm bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-indigo-800 px-4">
          <div className="container mx-auto flex gap-4">
            <NavLink
              to="/clerk/attendance-scan"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? "border-white text-white" 
                    : "border-transparent text-indigo-200 hover:text-white"
                }`
              }
            >
              📷 QR Scanner
            </NavLink>
            <NavLink
              to="/clerk/student-attendance"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? "border-white text-white" 
                    : "border-transparent text-indigo-200 hover:text-white"
                }`
              }
            >
              📊 Attendance Status
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="bg-white min-h-[70vh] rounded-xl shadow-sm border border-gray-100 p-4">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 text-xs">
        &copy; 2026 Sharda Academy Attendance Management System
      </footer>
    </div>
  );
};

export default ClerkLayout;