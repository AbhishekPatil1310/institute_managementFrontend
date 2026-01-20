<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [summaryRes, pendingRes] = await Promise.all([
          api.get("/api/reception/dashboard"),
          api.get("/api/reception/students/pending-fees")
        ]);
        
        setSummary(summaryRes.data);
        // Backend returns result.rows directly based on your controller
        setPendingStudents(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Modified Navigation Logic
   * Ensures the correct ID is sent to the Payments page
   */
  const handleCollectFee = (student) => {
    console.log("Passing student to payments:", student);
    
    navigate("/receptionist/payments", { 
      state: { 
        selectedStudent: {
          // If your SQL query uses 'admission_id' as 'admissionId' use that, 
          // otherwise fallback to 'id' or 'admission_id'
          admissionId: student.admissionId || student.admission_id || student.id, 
          studentName: student.studentName || student.name,
          batchName: student.batchName,
          pendingBalance: student.pendingBalance
        } 
      } 
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reception Dashboard</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 shadow-sm">
          {error}
        </div>
      )}

      {/* Summary Stats Section */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Today’s Collection</p>
            <p className="text-2xl font-bold text-gray-800">₹{summary.today_amount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Payments Today</p>
            <p className="text-2xl font-bold text-gray-800">{summary.today_count || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Students with Dues</p>
            <p className="text-2xl font-bold text-gray-800">{pendingStudents.length}</p>
          </div>
        </div>
      )}

      {/* Fee Defaulters List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Fee Defaulters List</h2>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold uppercase">
            Payment Required
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                    Loading pending records...
                  </td>
                </tr>
              ) : pendingStudents.length > 0 ? (
                pendingStudents.map((s) => (
                  <tr key={s.studentId || s.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.batchName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{s.phone}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-red-600 font-bold">
                        ₹{parseFloat(s.pendingBalance).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleCollectFee(s)}
                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
                      >
                        Collect Fee
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No students with pending fees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
>>>>>>> master
