import { useEffect, useState } from "react";
import api from "../../services/api";

const Dues = () => {
  const [dues, setDues] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/reception/dues")
      .then((res) => setDues(res.data))
      .catch(() => setError("Failed to load dues"));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Pending Dues
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Total Fee</th>
              <th className="p-2 border">Paid</th>
              <th className="p-2 border">Pending</th>
            </tr>
          </thead>
          <tbody>
            {dues.map((d) => (
              <tr key={d.admission_id}>
                <td className="p-2 border">
                  {d.student_name}
                </td>
                <td className="p-2 border">
                  {d.batch_name}
                </td>
                <td className="p-2 border">
                  ₹{d.total_fee}
                </td>
                <td className="p-2 border">
                  ₹{d.paid}
                </td>
                <td className="p-2 border font-semibold text-red-600">
                  ₹{d.pending}
                </td>
              </tr>
            ))}

            {!dues.length && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500"
                >
                  No pending dues 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dues;
