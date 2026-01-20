import { useEffect, useState } from "react";
import api from "../../services/api";

const FeeStatus = () => {
  const [feeData, setFeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/api/students/fee-status")
      .then((res) => {
        setFeeData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load fee information");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Financial Records...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Calculate totals for a summary header
  const totalDue = feeData.reduce((acc, curr) => acc + parseFloat(curr.pendingAmount), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">My Fee Status</h2>
        <p className="text-sm text-gray-500">Track your payments and outstanding balances</p>
      </header>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Outstanding Balance</p>
            <h3 className="text-4xl font-black mt-1">₹{totalDue.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Batch-wise Breakdown */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-700 px-1">Enrolled Batches</h4>
        {feeData.length > 0 ? (
          feeData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="font-bold text-lg text-gray-800">{item.batchName}</h5>
                    <p className="text-xs text-gray-400 font-medium">Joined: {new Date(item.enrolledOn).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.pendingAmount == 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.pendingAmount == 0 ? 'FULLY PAID' : 'PENDING'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(item.paidAmount / item.totalFee) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Total Fee</p>
                    <p className="font-bold text-gray-700 text-sm">₹{parseFloat(item.totalFee).toLocaleString()}</p>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Paid</p>
                    <p className="font-bold text-green-600 text-sm">₹{parseFloat(item.paidAmount).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Balance</p>
                    <p className="font-bold text-red-500 text-sm">₹{parseFloat(item.pendingAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-10 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            No active enrollments found.
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
        <p className="text-xs text-yellow-700 leading-relaxed">
          <strong>Note:</strong> If you have made a payment recently and it is not reflecting here, please contact the receptionist with your receipt number.
        </p>
      </div>
    </div>
  );
};

export default FeeStatus;