import { useEffect, useState } from "react";
import api from "../../services/api";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/reception/payments")
      .then((res) => setPayments(res.data))
      .catch(() => setError("Failed to load payments"));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Payments
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Source</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">
                  {p.paid_at?.split("T")[0]}
                </td>
                <td className="p-2 border">
                  {p.student_name}
                </td>
                <td className="p-2 border">
                  {p.batch_name}
                </td>
                <td className="p-2 border">
                  ₹{p.amount}
                </td>
                <td className="p-2 border">
                  {p.payment_source}
                </td>
              </tr>
            ))}

            {!payments.length && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
