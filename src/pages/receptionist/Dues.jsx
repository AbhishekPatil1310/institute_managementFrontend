import { useEffect, useState } from "react";
import api from "../../services/api";

/* Utility: Safe Number Format */
const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0" : num.toLocaleString();
};

const Dues = () => {
  const [dues, setDues] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 10;

  /* ========================
     Fetch Dues
  ======================== */
  const fetchDues = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(
        `/api/reception/students/pending-fees?page=${page}&limit=${limit}`
      );

      setDues(Array.isArray(res.data.data) ? res.data.data : []);

      setTotalPages(res.data.pagination?.totalPages || 1);
      setCurrentPage(res.data.pagination?.currentPage || 1);
      setTotalItems(res.data.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Fetch Dues Error:", err);
      setError("Failed to load dues");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Initial Load
  ======================== */
  useEffect(() => {
    fetchDues(1);
  }, []);

  /* ========================
     Pagination
  ======================== */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      fetchDues(page);
    }
  };

  /* ========================
     Initial Loader
  ======================== */
  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[250px] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">
          Loading dues...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">

      {/* ========================
          Header
      ======================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Pending Dues
          </h1>

          <p className="text-sm text-gray-500">
            Manage student fee balances
          </p>
        </div>

        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium self-start sm:self-center">
          Total Students: {totalItems}
        </div>

      </div>

      {/* ========================
          Error
      ======================== */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-sm text-red-700 font-medium">
            {error}
          </p>
        </div>
      )}

      {/* ========================
          Desktop Table
      ======================== */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 border-b text-left">Student</th>
                <th className="p-4 border-b text-left">Batch</th>
                <th className="p-4 border-b text-left">Contact</th>
                <th className="p-4 border-b text-right">Total</th>
                <th className="p-4 border-b text-right">Paid</th>
                <th className="p-4 border-b text-right">Pending</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {dues.map((d) => (
                <tr
                  key={d.admissionId}
                  className="hover:bg-blue-50/50 transition"
                >
                  <td className="p-4 font-semibold text-gray-800">
                    {d.studentName}
                  </td>

                  <td className="p-4 text-gray-600">
                    {d.batchName}
                  </td>

                  <td className="p-4 text-gray-600 text-sm font-mono">
                    {d.phone}
                  </td>

                  <td className="p-4 text-right">
                    ₹{formatCurrency(d.totalFee)}
                  </td>

                  <td className="p-4 text-right text-green-600">
                    ₹{formatCurrency(d.paidAmount)}
                  </td>

                  <td className="p-4 text-right font-bold text-red-600">
                    ₹{formatCurrency(d.pendingBalance)}
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

      {/* ========================
          Mobile Cards
      ======================== */}
      <div className="md:hidden grid grid-cols-1 gap-4">

        {dues.map((d) => (
          <div
            key={d.admissionId}
            className="bg-white p-5 rounded-xl shadow-sm border hover:border-blue-300 transition"
          >

            <div className="flex justify-between items-start mb-3">

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {d.studentName}
                </h3>

                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                  {d.batchName}
                </span>
              </div>

              <a
                href={`tel:${d.phone}`}
                className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition"
              >
                📞
              </a>

            </div>

            <p className="text-sm text-gray-500 mb-4 font-mono">
              {d.phone}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t">

              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Total
                </p>
                <p className="text-sm font-medium">
                  ₹{formatCurrency(d.totalFee)}
                </p>
              </div>

              <div className="text-center border-x">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Paid
                </p>
                <p className="text-sm font-medium text-green-600">
                  ₹{formatCurrency(d.paidAmount)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Due
                </p>
                <p className="text-sm font-bold text-red-600">
                  ₹{formatCurrency(d.pendingBalance)}
                </p>
              </div>

            </div>

          </div>
        ))}

      </div>

      {/* ========================
          Pagination
      ======================== */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">

          <p className="text-sm text-gray-600">
            Page{" "}
            <span className="font-semibold text-gray-800">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {totalPages}
            </span>
          </p>

          <div className="flex gap-2">

            <button
              onClick={() =>
                handlePageChange(currentPage - 1)
              }
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() =>
                handlePageChange(currentPage + 1)
              }
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>

          </div>
        </div>
      )}

      {/* ========================
          Empty State
      ======================== */}
      {!loading && dues.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm text-center border-2 border-dashed mt-10">

          <div className="text-5xl mb-4 text-green-400 font-bold">
            ✓
          </div>

          <h3 className="text-xl font-medium text-gray-800">
            No Pending Dues
          </h3>

          <p className="text-gray-500 mt-2">
            All student accounts are up to date.
          </p>

        </div>
      )}

    </div>
  );
};

export default Dues;
