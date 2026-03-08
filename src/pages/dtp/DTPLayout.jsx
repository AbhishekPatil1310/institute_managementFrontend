import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

const DTPLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dtp/dashboard", icon: "🏠" },
    { name: "Marks Entry", path: "/dtp/marks-entry", icon: "📝" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex md:flex-col shadow-xl md:h-auto flex-row">
        <div className="p-6 text-xl font-bold border-b border-slate-800 text-blue-400 tracking-wide">
          SHARDA ACADEMY
          <p className="text-[10px] text-gray-400 font-normal mt-1 uppercase">DTP Operator Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-x-auto flex md:flex-col md:space-x-0 space-x-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all whitespace-nowrap md:whitespace-normal ${
                location.pathname === item.path ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-gray-300"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="p-4 bg-slate-950 hover:bg-red-900 transition-colors flex items-center gap-3 text-sm font-medium md:w-full w-auto"
        >
          <span>🚪</span> Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 sm:px-8 justify-between overflow-x-auto">
          <h2 className="font-semibold text-gray-700">Exam Management</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">System Mode: <span className="text-green-600 font-bold">LIVE</span></span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DTPLayout;