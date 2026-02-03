import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Records per page

  const fetchDashboardData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetching summary and paginated list
      const [summaryRes, pendingRes] = await Promise.all([
        api.get("/api/reception/dashboard"),
        api.get(`/api/reception/students/pending-fees?page=${page}&limit=${limit}`)
      ]);
      
      setSummary(summaryRes.data);
      
      // Map to the new backend structure: { data: [...], pagination: {...} }
      setPendingStudents(Array.isArray(pendingRes.data.data) ? pendingRes.data.data : []);
      setTotalPages(pendingRes.data.pagination?.totalPages || 1);
      setCurrentPage(pendingRes.data.pagination?.currentPage || 1);
      
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(1);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!searchPhone.trim()) {
      return fetchDashboardData(1);
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await api.get(`/api/reception/students/pending-fees/search?phone=${searchPhone}`);
      
      // Search results usually bypass standard pagination in simple implementations
      setPendingStudents(Array.isArray(response.data.data) ? response.data.data : []);
      setTotalPages(1); 
    } catch (err) {
      console.error("Search Error:", err);
      setError("Error searching for student.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchPhone("");
    fetchDashboardData(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchDashboardData(newPage);
    }
  };

  const handleCollectFee = (student) => {
    navigate("/receptionist/payments", { 
      state: { 
        selectedStudent: {
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
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Records with Dues</p>
            {/* Showing total count from pagination metadata if available */}
            <p className="text-2xl font-bold text-gray-800">
                {summary.pagination?.totalItems || pendingStudents.length}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="font-semibold text-gray-700">Fee Defaulters List</h2>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-10 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              
              {searchPhone && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:bg-blue-300 flex items-center gap-2"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>
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
                    Loading records...
                  </td>
                </tr>
              ) : pendingStudents.length > 0 ? (
                pendingStudents.map((s) => (
                  <tr key={s.admissionId} className="hover:bg-blue-50/50 transition-colors">
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
                    {searchPhone ? "No matching students with pending fees." : "No pending fees found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!searchPhone && pendingStudents.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="inline-flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;