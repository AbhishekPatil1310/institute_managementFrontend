import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSearchParams } from "react-router-dom";

const Admissions = () => {
  const [params] = useSearchParams();
  const studentId = params.get("studentId");

  const [batches, setBatches] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [paymentSource, setPaymentSource] = useState("CASH");
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  useEffect(() => {
    if (!batchId) return;
    api
      .get(`/api/reception/batches/${batchId}/installments`)
      .then((res) => setInstallments(res.data));
  }, [batchId]);

  const submit = async () => {
    setError(null);
    try {
      await api.post("/api/reception/admissions", {
        studentId,
        batchId,
        installmentId,
        paymentSource,
      });
      alert("Admission completed");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Admission failed"
      );
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Student Admission
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white p-4 rounded shadow max-w-md space-y-3">
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={installmentId}
          onChange={(e) => setInstallmentId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select Installment</option>
          {installments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.months} Months (+₹{i.surcharge})
            </option>
          ))}
        </select>

        <select
          value={paymentSource}
          onChange={(e) => setPaymentSource(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="CASH">Cash</option>
          <option value="QR1">QR 1</option>
          <option value="QR2">QR 2</option>
        </select>

        <button
          onClick={submit}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Confirm Admission
        </button>
      </div>
    </div>
  );
};

export default Admissions;
