import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/student/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard"));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Welcome, {data.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Student Code</p>
          <p className="font-semibold">{data.student_code}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Batches</p>
          <p className="font-semibold">{data.batches}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">
            Attendance Today
          </p>
          <p
            className={`font-semibold ${
              data.attendance_marked_today
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.attendance_marked_today
              ? "Marked"
              : "Not Marked"}
          </p>
        </div>
      </div>

      {!data.attendance_marked_today && (
        <button
          onClick={() =>
            navigate("/student/attendance/scan")
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Mark Attendance
        </button>
      )}
    </div>
  );
};

export default StudentDashboard;
