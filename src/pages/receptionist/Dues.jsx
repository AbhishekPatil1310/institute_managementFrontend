import { useEffect, useState } from "react";
import api from "../../services/api";

const Dues = () => {
  const [dues, setDues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchDues = (page = 1) => {
    setLoading(true);
    api
      .get(`/api/reception/students/pending-fees?page=${page}&limit=${limit}`)
      .then((res) => {
        // Updated to handle paginated response structure
        setDues(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setCurrentPage(res.data.pagination?.currentPage || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dues");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDues(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchDues(newPage);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-secondary font-medium">Loading dues...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Pending Dues</h1>
          <p className="text-sm text-text-secondary">Manage student fee collections and balances</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium self-start sm:self-center">
          Total Students: {totalItems}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Table for Medium and Large Screens */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-neutral-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 border-b text-left">Student</th>
                <th className="p-4 border-b text-left">Batch</th>
                <th className="p-4 border-b text-left">Contact</th>
                <th className="p-4 border-b text-right">Total Fee</th>
                <th className="p-4 border-b text-right">Paid</th>
                <th className="p-4 border-b text-right">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-dark">
              {dues.map((d) => (
                <tr key={d.admissionId} className="hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{d.studentName}</td>
                  <td className="p-4 text-text-secondary">{d.batchName}</td>
                  <td className="p-4 text-text-secondary text-sm font-mono">{d.phone}</td>
                  <td className="p-4 text-right">₹{parseFloat(d.totalFee).toLocaleString()}</td>
                  <td className="p-4 text-right text-green-600">₹{parseFloat(d.paidAmount).toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-red-600">
                    ₹{parseFloat(d.pendingBalance).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards for Small Screens */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {dues.map((d) => (
          <div 
            key={d.admissionId} 
            className="bg-white p-5 rounded-xl shadow-sm border border-neutral-dark hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-text-primary">{d.studentName}</h3>
                <span className="inline-block bg-neutral text-text-secondary text-xs px-2 py-1 rounded mt-1">
                  {d.batchName}
                </span>
              </div>
              <a 
                href={`tel:${d.phone}`} 
                className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-text-secondary mb-4 font-mono">{d.phone}</p>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral">
              <div className="text-center">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Total</p>
                <p className="text-sm font-medium text-text-primary">₹{parseFloat(d.totalFee).toLocaleString()}</p>
              </div>
              <div className="text-center border-x border-neutral">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Paid</p>
                <p className="text-sm font-medium text-green-600">₹{parseFloat(d.paidAmount).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Due</p>
                <p className="text-sm font-bold text-red-600">₹{parseFloat(d.pendingBalance).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-neutral-dark">
          <p className="text-sm text-text-secondary">
            Showing Page <span className="font-semibold text-text-primary">{currentPage}</span> of <span className="font-semibold text-text-primary">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-neutral disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-neutral disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !dues.length && (
        <div className="bg-white p-12 rounded-xl shadow-sm text-center border-2 border-dashed border-neutral-dark">
          <div className="text-5xl mb-4 text-green-400 font-bold italic">Clear!</div>
          <h3 className="text-xl font-medium text-text-primary">No Pending Dues</h3>
          <p className="text-text-secondary mt-2">All student accounts are currently up to date.</p>
        </div>
      )}
    </div>
  );
};

export default Dues;