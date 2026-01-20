import { useState, useEffect } from "react";
import api from "../../services/api";

const AttendanceStats = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/admin/batches").then((res) => setBatches(res.data));
  }, []);

  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedStudent(null);
    setStats(null);
    if (batchId) {
      const res = await api.get(`/api/clerk/attendance/batches/${batchId}/students`);
      setStudents(res.data);
    }
  };

  const fetchStudentDetails = async (student) => {
    setSelectedStudent(student);
    const res = await api.get(`/api/clerk/attendance/batches/${selectedBatch}/students/${student.student_id}/stats`);
    setStats(res.data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800">Attendance Reports</h2>

      {/* Step 1: Batch Selection */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <select 
          className="w-full p-3 border rounded-lg"
          onChange={(e) => handleBatchChange(e.target.value)}
          value={selectedBatch}
        >
          <option value="">-- Select Batch --</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 2: Student List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-3 bg-gray-50 border-b font-bold text-sm uppercase text-gray-500">Students</div>
          <div className="max-h-[500px] overflow-y-auto divide-y">
            {students.map(s => (
              <button
                key={s.student_id}
                onClick={() => fetchStudentDetails(s)}
                className={`w-full text-left p-4 hover:bg-indigo-50 transition ${selectedStudent?.student_id === s.student_id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
              >
                <p className="font-bold text-gray-800">{s.student_name}</p>
                <p className="text-xs text-gray-400">{s.student_code}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Detailed Stats */}
        <div className="md:col-span-2 space-y-4">
          {stats ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-xl font-bold mb-4">{selectedStudent.student_name}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-bold uppercase">Total Classes</p>
                    <p className="text-2xl font-black">{stats.total_classes}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-bold uppercase">Present</p>
                    <p className="text-2xl font-black">{stats.present_days}</p>
                  </div>
                  <div className="p-3 bg-indigo-600 text-white rounded-lg">
                    <p className="text-xs font-bold uppercase opacity-80">Percentage</p>
                    <p className="text-2xl font-black">{stats.percentage}%</p>
                  </div>
                </div>
              </div>

              {/* Day-wise Log */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-3 bg-gray-50 border-b font-bold text-sm uppercase text-gray-500">Daily Logs</div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <tbody className="divide-y">
                      {stats.logs?.map((log, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'P' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status === 'P' ? 'PRESENT' : 'ABSENT'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              Select a student to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;