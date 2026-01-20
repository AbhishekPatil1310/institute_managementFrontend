import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";

const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [sources, setSources] = useState([]); 
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Data passed from Dashboard
  const selectedStudent = location.state?.selectedStudent;

  const [formData, setFormData] = useState({
    amount: selectedStudent?.pendingBalance || "",
    payment_source: "", 
    receipt_number: ""
  });

  useEffect(() => {
    fetchPayments();
    fetchSources();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/api/reception/payments");
      setPayments(res.data);
    } catch (err) {
      setError("Failed to load payment history");
    }
  };

  const fetchSources = async () => {
    try {
      const res = await api.get("/api/reception/payment_source");
      setSources(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, payment_source: res.data[0].enumlabel }));
      }
    } catch (err) {
      console.error("Error fetching sources", err);
    }
  };

  const handleCollectFee = async (e) => {
    e.preventDefault();
    
    // 1. Robust ID Check: Support both camelCase and snake_case from navigation state
    const admissionId = selectedStudent?.admissionId || selectedStudent?.admission_id;

    if (!admissionId) {
      alert("Error: Admission ID is missing. Please return to the dashboard and try again.");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/reception/payments", {
        admission_id: admissionId, // Explicitly send as snake_case for backend
        amount: formData.amount,
        payment_source: formData.payment_source,
        receipt_number: formData.receipt_number || null 
      });
      
      alert(`Payment Success! Receipt No: ${res.data.receipt_number}`);
      
      // Reset view
      navigate("/receptionist/payments", { replace: true, state: {} });
      fetchPayments();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      alert(serverMsg || "Failed to save payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments Management</h1>

      {/* Payment Collection Form */}
      {selectedStudent && (
        <div className="mb-10 bg-blue-600 p-1 rounded-xl shadow-lg">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-blue-800">Collect Fee: {selectedStudent.studentName}</h2>
                <p className="text-sm text-gray-500 font-medium">{selectedStudent.batchName}</p>
              </div>

            </div>

            <form onSubmit={handleCollectFee} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt No. (Optional)</label>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (Dues: ₹{selectedStudent.pendingBalance})</label>
                <input 
                  required 
                  type="number" 
                  className="w-full border p-2 rounded mt-1 outline-blue-500" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Source</label>
                <select 
                  className="w-full border p-2 rounded mt-1 bg-white outline-blue-500" 
                  value={formData.payment_source} 
                  onChange={e => setFormData({...formData, payment_source: e.target.value})}
                >
                  {sources.map((src, index) => (
                    <option key={index} value={src.enumlabel}>
                      {src.enumlabel}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                disabled={submitting} 
                type="submit" 
                className="bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 h-[42px] transition-all"
              >
                {submitting ? "Processing..." : "Confirm Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Recent Transactions</h2>
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
            <tbody className="divide-y divide-gray-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.student_name}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{p.batch_name}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono text-xs">
                      {p.receipt_number}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{p.payment_source}</td>
                  <td className="p-4 text-right font-bold text-green-600">
                    ₹{parseFloat(p.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;