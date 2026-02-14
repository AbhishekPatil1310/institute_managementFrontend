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
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ========================
     Fetch Batches
  ======================== */
  useEffect(() => {
    api
      .get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ========================
     Fetch Installments
  ======================== */
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

  /* ========================
     Fetch References
  ======================== */
  useEffect(() => {
    api
      .get("/api/reception/references")
      .then((res) => setReferences(res.data))
      .catch(() => setError("Failed to load references"));
  }, []);

  /* ========================
     Submit Admission
  ======================== */
  const submit = async () => {
    setError(null);
    setSuccess(null);

    if (!studentId || !batchId || !installmentId) {
      setError("Please select batch and installment");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/reception/admissions", {
        studentId,
        batchId,
        installmentId,
        referenceId: referenceId || null,
        paymentSource,
      });

      setSuccess("Admission completed successfully");

      // Reset form
      setBatchId("");
      setInstallmentId("");
      setReferenceId("");
    } catch (err) {
      setError(err?.response?.data?.message || "Admission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Student Admission
      </h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-lg shadow space-y-5">

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select Batch
          </label>

          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a batch</option>

            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Installment */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select Installment
          </label>

          <select
            value={installmentId}
            onChange={(e) => setInstallmentId(e.target.value)}
            disabled={!batchId}
            className="border px-3 py-2 rounded w-full disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose installment</option>

            {installments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.months} Months (+₹{i.surcharge})
              </option>
            ))}
          </select>
        </div>

        {/* Reference */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Reference (Optional)
          </label>

          <select
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No reference</option>

            {references.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (-₹{r.concession})
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={submit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Processing..." : "Confirm Admission"}
        </button>
      </div>
    </div>
  );
};

export default Admissions;
