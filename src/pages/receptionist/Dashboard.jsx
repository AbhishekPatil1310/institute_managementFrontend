import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Search & Pagination */
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  /* ========================
     Fetch Dashboard Data
  ======================== */
  const fetchDashboardData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, pendingRes] = await Promise.all([
        api.get("/api/reception/dashboard"),
        api.get(
          `/api/reception/students/pending-fees?page=${page}&limit=${limit}`
        ),
      ]);

      setSummary(summaryRes.data);

      setPendingStudents(
        Array.isArray(pendingRes.data.data) ? pendingRes.data.data : []
      );

      setTotalPages(pendingRes.data.pagination?.totalPages || 1);
      setCurrentPage(pendingRes.data.pagination?.currentPage || 1);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Initial Load
  ======================== */
  useEffect(() => {
    fetchDashboardData(1);
  }, []);

  /* ========================
     Search
  ======================== */
  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!searchPhone.trim()) {
      fetchDashboardData(1);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const res = await api.get(
        `/api/reception/students/pending-fees/search?phone=${searchPhone}`
      );

      setPendingStudents(
        Array.isArray(res.data.data) ? res.data.data : []
      );

      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search Error:", err);
      setError("Error searching for student");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchPhone("");
    fetchDashboardData(1);
  };

  /* ========================
     Pagination
  ======================== */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      fetchDashboardData(page);
    }
  };

  /* ========================
     Collect Fee
  ======================== */
  const handleCollectFee = (student) => {
    navigate("/receptionist/payments", {
      state: {
        selectedStudent: {
          admissionId:
            student.admissionId ||
            student.admission_id ||
            student.id,

          studentName: student.studentName || student.name,
          batchName: student.batchName,
          pendingBalance: student.pendingBalance,
        },
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Reception Dashboard
      </h1>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      {/* ========================
          Summary Cards
      ======================== */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Today’s Collection
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              ₹{summary.today_amount || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Payments Today
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {summary.today_count || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Total Pending Records
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {summary.pagination?.totalItems || pendingStudents.length}
            </p>
          </div>

        </div>
      )}

      {/* ========================
          Table Card
      ======================== */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">

          <h2 className="font-semibold text-gray-700">
            Fee Defaulters
          </h2>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <div className="relative flex-grow">

              <input
                type="text"
                placeholder="Search by phone..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-10 pr-10 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {/* Search Icon */}
              <span className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </span>

              {/* Clear Button */}
              {searchPhone && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}

            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>

          </form>
        </div>

        {/* ========================
            Table
        ======================== */}
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-gray-400"
                  >
                    Loading records...
                  </td>
                </tr>
              )}

              {/* Data */}
              {!loading && pendingStudents.length > 0 &&
                pendingStudents.map((s) => (
                  <tr
                    key={s.admissionId}
                    className="hover:bg-blue-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">
                      {s.studentName}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.batchName}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {s.phone}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      ₹{Number(s.pendingBalance).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCollectFee(s)}
                        className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition"
                      >
                        Collect Fee
                      </button>
                    </td>
                  </tr>
                ))}

              {/* Empty */}
              {!loading && pendingStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-gray-500"
                  >
                    {searchPhone
                      ? "No matching students found"
                      : "No pending fees available"}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* ========================
            Pagination
        ======================== */}
        {!searchPhone && pendingStudents.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">

            <p className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold">{totalPages}</span>
            </p>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50"
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
