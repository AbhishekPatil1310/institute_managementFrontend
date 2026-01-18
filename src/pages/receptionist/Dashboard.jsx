import { useEffect, useState } from "react";
import api from "../../services/api";

const ReceptionistDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/reception/dashboard")
      .then((res) => setSummary(res.data))
      .catch(() => setError("Failed to load dashboard"));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">
        Reception Dashboard
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              Today’s Collection
            </p>
            <p className="text-xl font-semibold">
              ₹{summary.today_amount}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              Payments Today
            </p>
            <p className="text-xl font-semibold">
              {summary.today_count}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              Students with Dues
            </p>
            <p className="text-xl font-semibold">
              {summary.pending_students}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
