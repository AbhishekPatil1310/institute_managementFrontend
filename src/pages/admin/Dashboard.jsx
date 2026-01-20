import { useEffect, useState } from "react";
import api from "../../services/api";

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const AdminDashboard = () => {
  const [financial, setFinancial] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState(null);
  
  // Navigation/Drill-down States
  const [selectedBatch, setSelectedBatch] = useState(null); // Stores batch list data
  const [selectedStudent, setSelectedStudent] = useState(null); // Stores full profile
  const [view, setView] = useState("stats"); // "stats", "batch", "profile"
  
  const month = getCurrentMonth();

  /* ---------- Initial Load: Stats & Batches ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [finRes, batchRes] = await Promise.all([
          api.get(`/api/admin/reports/financial?month=${month}`),
          api.get(`/api/admin/batches`),
        ]);
        setFinancial(finRes.data?.[0] || null);
        setBatches(batchRes.data || []);
      } catch {
        setError("Failed to load dashboard data");
      }
    };
    load();
  }, [month]);

  /* ---------- Function: Load Batch Students ---------- */
  const handleBatchClick = async (batchId) => {
    try {
      const res = await api.get(`/api/admin/reports/batch-students/${batchId}`);
      setSelectedBatch(res.data);
      setView("batch");
    } catch {
      setError("Failed to load students for this batch");
    }
  };

  /* ---------- Function: Load Student Profile ---------- */
  const handleStudentClick = async (studentId) => {
    try {
      const res = await api.get(`/api/admin/reports/student-profile/${studentId}`);
      setSelectedStudent(res.data);
      setView("profile");
    } catch {
      setError("Failed to load student profile");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          {view === "stats" && "Admin Dashboard"}
          {view === "batch" && "Batch Management"}
          {view === "profile" && "Student Detailed Profile"}
        </h1>
        {view !== "stats" && (
          <button 
            onClick={() => setView(view === "profile" ? "batch" : "stats")}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition"
          >
            ← Back
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</p>}

      {/* VIEW 1: MAIN STATS & BATCH LIST */}
      {view === "stats" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow-sm border">
              <p className="text-sm text-gray-500">Collection ({month})</p>
              <p className="text-2xl font-bold text-blue-600">₹{financial?.total_collected ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border">
              <p className="text-sm text-gray-500">System Status</p>
              <p className="text-2xl font-bold text-green-600">Operational</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Select Batch to View Students</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map(b => (
              <div 
                key={b.id} 
                onClick={() => handleBatchClick(b.id)}
                className="bg-white p-5 rounded-xl border hover:border-blue-500 cursor-pointer transition shadow-sm group"
              >
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{b.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Click to view fee status & students</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* VIEW 2: BATCH STUDENTS (PENDING VS ALL) */}
      {view === "batch" && selectedBatch && (
        <div className="space-y-8">
          {/* Section: Pending Fees */}
          <div>
            <h2 className="text-red-600 font-bold flex items-center mb-4 text-lg">
              <span className="mr-2">⚠️</span> Pending Fee Students ({selectedBatch.pendingStudents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBatch.pendingStudents.map(s => (
                <div key={s.studentId} onClick={() => handleStudentClick(s.studentId)} className="bg-red-50 p-4 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100">
                  <p className="font-bold">{s.studentName}</p>
                  <p className="text-sm text-red-600 font-semibold">Pending: ₹{s.pendingBalance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: All Students */}
          <div>
            <h2 className="text-gray-700 font-bold mb-4 text-lg">All Students ({selectedBatch.allStudents.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBatch.allStudents.map(s => (
                <div key={s.studentId} onClick={() => handleStudentClick(s.studentId)} className="bg-white p-4 rounded-lg border cursor-pointer hover:border-blue-400">
                  <p className="font-bold">{s.studentName}</p>
                  <p className="text-xs text-gray-500">{s.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STUDENT FULL PROFILE */}
      {view === "profile" && selectedStudent && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold">{selectedStudent.studentName}</h2>
            <p className="opacity-80">{selectedStudent.email} | {selectedStudent.phone}</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Enrollment & Fees */}
            <div>
              <h3 className="font-bold border-b pb-2 mb-3">Batch & Fees</h3>
              {selectedStudent.enrollments?.map((e, i) => (
                <div key={i} className="mb-4 bg-gray-50 p-3 rounded">
                  <p className="font-bold text-blue-700">{e.batchName}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Total: ₹{e.finalFee}</span>
                    <span className="text-green-600">Paid: ₹{e.paid}</span>
                  </div>
                  <p className="text-sm text-red-500 font-bold mt-1">Pending: ₹{e.pending}</p>
                </div>
              ))}
            </div>

            {/* Attendance Stats */}
            <div>
              <h3 className="font-bold border-b pb-2 mb-3">Attendance Summary</h3>
              {selectedStudent.attendanceStats?.map((a, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded mb-2">
                  <span className="text-sm font-medium">{a.batchName}</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round((a.presentCount/a.totalClasses)*100)}%</span>
                </div>
              ))}
            </div>

            {/* Payment History */}
            <div className="md:col-span-2">
              <h3 className="font-bold border-b pb-2 mb-3">Payment Logs (Receipts)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Receipt #</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Source</th>
                      <th className="p-2">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.payments?.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="p-2 font-mono">{p.receiptNumber}</td>
                        <td className="p-2 font-bold text-green-600">₹{p.amount}</td>
                        <td className="p-2">{p.source}</td>
                        <td className="p-2">{p.batchName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;