import { useEffect, useState } from "react";
import api from "../../../services/api";

const getMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const FinancialReports = () => {
  const [month, setMonth] = useState(getMonth());
  const [summary, setSummary] = useState(null);
  const [sources, setSources] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [batchReport, setBatchReport] = useState(null);
  const [error, setError] = useState(null);

  /* ---------- load batches ---------- */
  useEffect(() => {
    api.get("/api/admin/batches")
      .then(res => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ---------- load monthly data ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, srcRes] = await Promise.all([
          api.get(`/api/admin/reports/financial?month=${month}`),
          api.get(`/api/admin/reports/payment-sources?month=${month}`),
        ]);

        setSummary(sumRes.data?.[0] || null);
        setSources(srcRes.data);
      } catch {
        setError("Failed to load financial reports");
      }
    };

    load();
  }, [month]);

  /* ---------- batch report ---------- */
  useEffect(() => {
    if (!batchId) return;

    api.get(`/api/admin/reports/batch/${batchId}`)
      .then(res => setBatchReport(res.data))
      .catch(() => setError("Failed to load batch report"));
  }, [batchId]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Financial Reports
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Month selector */}
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border px-3 py-2 rounded mb-4"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-xl font-semibold">
            ₹{summary?.total_collected ?? 0}
          </p>
        </div>
      </div>

      {/* Payment sources */}
      <div className="bg-white p-4 rounded shadow mb-6 max-w-md">
        <h2 className="font-semibold mb-2">Payment Sources</h2>
        {sources.map((s) => (
          <div key={s.payment_source} className="flex justify-between text-sm">
            <span>{s.payment_source}</span>
            <span>₹{s.total_amount}</span>
          </div>
        ))}
        {!sources.length && (
          <p className="text-gray-500 text-sm">No data</p>
        )}
      </div>

      {/* Batch-wise */}
      <div className="max-w-md">
        <h2 className="font-semibold mb-2">Batch-wise</h2>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-3"
        >
          <option value="">-- Select Batch --</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {batchReport && (
          <div className="bg-white p-4 rounded shadow text-sm">
            <p>Total Fee: ₹{batchReport.total_fee}</p>
            <p>Collected: ₹{batchReport.total_collected}</p>
            <p className="font-semibold">
              Pending: ₹{batchReport.pending}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
