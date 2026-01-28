import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSearchParams } from "react-router-dom";

const Admissions = () => {
  const [params] = useSearchParams();
  const studentId = params.get("studentId");

  const [batches, setBatches] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [references, setReferences] = useState([]);

  const [batchId, setBatchId] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [paymentSource] = useState("CASH");
  const [error, setError] = useState(null);

  // Fetch batches
  useEffect(() => {
    api
      .get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  // Fetch installments when batch changes
  useEffect(() => {
    if (!batchId) {
      setInstallments([]);
      setInstallmentId("");
      return;
    }

    api
      .get(`/api/reception/batches/${batchId}/installments`)
      .then((res) => setInstallments(res.data))
      .catch(() => setError("Failed to load installments"));
  }, [batchId]);

  // Fetch references
  useEffect(() => {
    api
      .get("/api/reception/references")
      .then((res) => setReferences(res.data))
      .catch(() => setError("Failed to load references"));
  }, []);

  const submit = async () => {
    setError(null);

    if (!studentId || !batchId || !installmentId) {
      setError("Please select batch and installment");
      return;
    }

    try {
      await api.post("/api/reception/admissions", {
        studentId,
        batchId,
        installmentId,
        referenceId: referenceId || null,
        paymentSource,
      });

      alert("Admission completed");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Admission failed"
      );
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Student Admission
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white p-4 rounded shadow w-full space-y-3">
        {/* Batch */}
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

        {/* Installment */}
        <select
          value={installmentId}
          onChange={(e) => setInstallmentId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          disabled={!batchId}
        >
          <option value="">Select Installment</option>
          {installments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.months} Months (+₹{i.surcharge})
            </option>
          ))}
        </select>

        {/* Reference (Optional) */}
        <select
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select Reference (Optional)</option>
          {references.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (-₹{r.concession})
            </option>
          ))}
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
