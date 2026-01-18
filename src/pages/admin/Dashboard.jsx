import { useEffect, useState } from "react";
import api from "../../services/api";

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

const AdminDashboard = () => {
  const [financial, setFinancial] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState(null);
  const month = getCurrentMonth();

  useEffect(() => {
    const load = async () => {
      try {
        const [finRes, attRes] = await Promise.all([
          api.get(
            `/api/admin/reports/financial?month=${month}`
          ),
          api.get(
            `/api/admin/reports/attendance/overall?month=${month}`
          ),
        ]);

        setFinancial(finRes.data?.[0] || null);
        setAttendance(attRes.data || null);
      } catch {
        setError("Failed to load dashboard data");
      }
    };

    load();
  }, [month]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Admin Dashboard
      </h1>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Collection */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">
            Collection ({month})
          </p>
          <p className="text-2xl font-semibold">
            ₹{financial?.total_collected ?? 0}
          </p>
        </div>

        {/* Attendance */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">
            Attendance ({month})
          </p>
          <p className="text-2xl font-semibold">
            {attendance?.attendance_percentage
              ? `${Math.round(
                  attendance.attendance_percentage
                )}%`
              : "—"}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">
            System Status
          </p>
          <p className="text-2xl font-semibold text-green-600">
            Operational
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
