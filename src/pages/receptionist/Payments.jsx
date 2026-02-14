import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

/* Utility */
const formatAmount = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0" : num.toLocaleString();
};

const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /* ========================
     Navigation Data
  ======================== */
  const selectedStudent = location.state?.selectedStudent;

  /* ========================
     State
  ======================== */
  const [payments, setPayments] = useState([]);
  const [sources, setSources] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [formData, setFormData] = useState({
    amount: selectedStudent?.pendingBalance || "",
    payment_source: "",
    receipt_number: "",
  });

  /* ========================
     Initial Load
  ======================== */
  useEffect(() => {
    fetchPayments();
    fetchSources();
  }, []);

  /* ========================
     Fetch Payments
  ======================== */
  const fetchPayments = async () => {
    try {
      setLoadingHistory(true);
      setError(null);

      const res = await api.get("/api/reception/payments");

      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment history");
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ========================
     Fetch Sources
  ======================== */
  const fetchSources = async () => {
    try {
      const res = await api.get("/api/reception/payment_source");

      const list = res.data || [];

      setSources(list);

      if (list.length) {
        setFormData((prev) => ({
          ...prev,
          payment_source: list[0].enumlabel,
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load payment sources");
    }
  };

  /* ========================
     Submit Payment
  ======================== */
  const handleCollectFee = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const admissionId =
      selectedStudent?.admissionId ||
      selectedStudent?.admission_id;

    if (!admissionId) {
      setError("Admission ID missing. Please go back and try again.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/api/reception/payments", {
        admission_id: admissionId,
        amount: formData.amount,
        payment_source: formData.payment_source,
        receipt_number: formData.receipt_number || null,
      });

      setSuccess(
        `Payment successful. Receipt: ${res.data.receipt_number}`
      );

      setFormData((prev) => ({
        ...prev,
        amount: "",
        receipt_number: "",
      }));

      fetchPayments();

      // Clear navigation state
      navigate("/receptionist/payments", {
        replace: true,
        state: {},
      });
    } catch (err) {
      console.error(err);

      const serverMsg = err.response?.data?.message;

      setError(serverMsg || "Failed to save payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-7xl mx-auto">

      {/* ========================
          Page Title
      ======================== */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Payments Management
      </h1>

      {/* ========================
          Alerts
      ======================== */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-6 rounded border-l-4 border-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 mb-6 rounded border-l-4 border-green-500">
          {success}
        </div>
      )}

      {/* ========================
          Payment Form
      ======================== */}
      {selectedStudent && (
        <div className="mb-10 bg-blue-600 p-1 rounded-xl shadow-lg">

          <div className="bg-white p-6 rounded-lg">

            <div className="mb-6">

              <h2 className="text-lg font-bold text-blue-800">
                Collect Fee: {selectedStudent.studentName}
              </h2>

              <p className="text-sm text-gray-500 font-medium">
                {selectedStudent.batchName}
              </p>

              <p className="text-sm text-red-600 mt-1">
                Pending: ₹
                {formatAmount(
                  selectedStudent.pendingBalance
                )}
              </p>

            </div>

            <form
              onSubmit={handleCollectFee}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >

              {/* Receipt */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Receipt No. (Optional)
                </label>

                <input
                  type="text"
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.receipt_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receipt_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Amount
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  max={selectedStudent.pendingBalance}
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              {/* Source */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Payment Source
                </label>

                <select
                  className="w-full border p-2 rounded mt-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.payment_source}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_source: e.target.value,
                    })
                  }
                >
                  {sources.map((src, index) => (
                    <option
                      key={index}
                      value={src.enumlabel}
                    >
                      {src.enumlabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                disabled={submitting}
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 h-[42px] transition"
              >
                {submitting
                  ? "Processing..."
                  : "Confirm Payment"}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ========================
          History
      ======================== */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">
            Recent Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest">

              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Receipt</th>
                <th className="p-4">Source</th>
                <th className="p-4 text-right">Amount</th>
              </tr>

            </thead>

            <tbody className="divide-y">

              {/* Loading */}
              {loadingHistory && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-gray-400"
                  >
                    Loading transactions...
                  </td>
                </tr>
              )}

              {/* Data */}
              {!loadingHistory &&
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      {new Date(
                        p.paid_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {p.student_name}
                      </div>

                      <div className="text-[10px] text-gray-400 uppercase">
                        {p.batch_name}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono text-xs">
                        {p.receipt_number}
                      </span>
                    </td>

                    <td className="p-4 text-gray-600">
                      {p.payment_source}
                    </td>

                    <td className="p-4 text-right font-bold text-green-600">
                      ₹{formatAmount(p.amount)}
                    </td>
                  </tr>
                ))}

              {/* Empty */}
              {!loadingHistory &&
                payments.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-gray-400"
                    >
                      No transactions yet
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

export default Payments;
