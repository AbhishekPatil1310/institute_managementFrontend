import { useEffect, useState } from "react";
import api from "../../services/api";

const Exams = () => {
  const [batches, setBatches] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Batches on component mount
  useEffect(() => {
    const fetchMyBatches = async () => {
      try {
        setLoading(true);
        // Calls: app.use("/api/students") + router.get("/batches")
        const res = await api.get("/api/students/students/batches");
        setBatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError("Failed to load your batches.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBatches();
  }, []);

  // 2. Fetch Exams whenever a batch is selected
  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedBatchId) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/students/batches/${selectedBatchId}/exams`);
        setExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams for this batch.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [selectedBatchId]);

  // Back button handler
  const handleBack = () => {
    setSelectedBatchId(null);
    setExams([]);
    setError(null);
  };

  if (loading && batches.length === 0) {
    return <div className="p-10 text-center text-gray-500">Loading your courses...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedBatchId ? "Batch Exams" : "Select Your Batch"}
        </h1>
        {selectedBatchId && (
          <button 
            onClick={handleBack}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-all"
          >
            ← Change Batch
          </button>
        )}
      </div>

      {error && <p className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</p>}

      {/* VIEW 1: BATCH SELECTION */}
      {!selectedBatchId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div 
              key={batch.batchId} 
              onClick={() => setSelectedBatchId(batch.batchId)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                {batch.batchName}
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{batch.description || "No description available"}</p>
              <div className="mt-4 flex items-center text-blue-500 text-sm font-semibold">
                View Scheduled Exams →
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-xl text-center text-gray-400">
              No active batch admissions found.
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: EXAMS LIST */
        <div className="animate-fadeIn">
          {loading ? (
            <div className="text-center p-10 text-gray-500">Fetching exams...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Exam Name</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-600">{e.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(e.exam_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                          Upcoming
                        </span>
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-10 text-center text-gray-400">
                        No exams scheduled for this batch yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Exams;
