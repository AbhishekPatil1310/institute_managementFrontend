import { useEffect, useState } from "react";
import api from "../../../services/api";

const getMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const AttendanceReports = () => {
  const [month, setMonth] = useState(getMonth());
  const [overall, setOverall] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [batchData, setBatchData] = useState([]);
  const [error, setError] = useState(null);

  /* ---------- load batches ---------- */
  useEffect(() => {
    api.get("/api/admin/batches")
      .then(res => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ---------- overall ---------- */
  useEffect(() => {
    api.get(`/api/admin/reports/attendance/overall?month=${month}`)
      .then(res => setOverall(res.data))
      .catch(() => setError("Failed to load attendance"));
  }, [month]);

  /* ---------- batch ---------- */
  useEffect(() => {
    if (!batchId) return;

    api.get(
      `/api/admin/reports/attendance/batch/${batchId}?month=${month}`
    )
      .then(res => setBatchData(res.data))
      .catch(() => setError("Failed to load batch attendance"));
  }, [batchId, month]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Attendance Reports
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border px-3 py-2 rounded mb-4"
      />

      {/* Overall */}
      <div className="bg-white p-4 rounded shadow mb-6 max-w-sm">
        <p className="text-sm text-gray-500">Overall Attendance</p>
        <p className="text-xl font-semibold">
          {overall?.attendance_percentage
            ? `${Math.round(overall.attendance_percentage)}%`
            : "—"}
        </p>
      </div>

      {/* Batch-wise */}
      <div className="max-w-md">
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-3"
        >
          <option value="">-- Select Batch --</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {batchData.length > 0 && (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Present</th>
                  <th className="p-2 border">Absent</th>
                </tr>
              </thead>
              <tbody>
                {batchData.map(d => (
                  <tr key={d.attendance_date}>
                    <td className="p-2 border">
                      {d.attendance_date}
                    </td>
                    <td className="p-2 border">{d.present}</td>
                    <td className="p-2 border">{d.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!batchData.length && batchId && (
          <p className="text-gray-500 text-sm">
            No attendance data
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceReports;
