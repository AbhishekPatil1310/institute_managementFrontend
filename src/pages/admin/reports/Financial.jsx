<<<<<<< HEAD
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
=======
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
  const [batchSources, setBatchSources] = useState([]); // NEW: State for sources per batch
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

  /* ---------- batch report & batch sources ---------- */
  useEffect(() => {
    if (!batchId) {
      setBatchReport(null);
      setBatchSources([]);
      return;
    }

    const loadBatchData = async () => {
      try {
        // Fetching both general stats and source breakdown for the selected batch
        const [reportRes, sourceRes] = await Promise.all([
          api.get(`/api/admin/reports/batch/${batchId}`),
          api.get(`/api/admin/reports/payment-sources/batch/${batchId}`)
        ]);

        setBatchReport(reportRes.data);
        setBatchSources(sourceRes.data);
      } catch {
        setError("Failed to load batch report details");
      }
    };

    loadBatchData();
  }, [batchId]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">
        Financial Reports
      </h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Month selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-500 mb-1">Filter Global Data by Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded bg-white shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Monthly Overview */}
        <div>
          <h2 className="font-semibold mb-3 text-gray-700">Monthly Overview ({month})</h2>
          
          <div className="bg-white p-4 rounded shadow mb-4">
            <p className="text-sm text-gray-500">Total Collected Globally</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{summary?.total_collected ?? 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wider">
              Global Sources Breakdown
            </h3>
            {sources.map((s) => (
              <div key={s.payment_source} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-gray-600">{s.payment_source}</span>
                <span className="font-medium">₹{s.total_amount}</span>
              </div>
            ))}
            {!sources.length && <p className="text-gray-500 text-sm">No data for this month</p>}
          </div>
        </div>

        {/* Right Column: Batch Analysis */}
        <div className="w-full">
          <h2 className="font-semibold mb-3 text-gray-700">Batch-wise Analysis</h2>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-4 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select a Batch --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {batchReport && (
            <div className="bg-white p-5 rounded shadow">
              {/* Core Stats */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-center border-b pb-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Total Fee</p>
                  <p className="font-semibold text-gray-800">₹{batchReport.total_fee}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Collected</p>
                  <p className="font-semibold text-green-600">₹{batchReport.total_collected}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Pending</p>
                  <p className="font-semibold text-red-500">₹{batchReport.pending}</p>
                </div>
              </div>

              {/* NEW: Batch Specific Source Breakdown */}
              <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wider">
                Collected Per Source (This Batch)
              </h3>
              <div className="space-y-2">
                {batchSources.map((bs) => (
                  <div key={bs.payment_source} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-700">{bs.payment_source}</span>
                      <p className="text-[10px] text-gray-400">{bs.transaction_count} transactions</p>
                    </div>
                    <span className="font-bold text-gray-800">₹{bs.total_received}</span>
                  </div>
                ))}
                {batchSources.length === 0 && (
                  <p className="text-gray-400 text-sm italic py-2 text-center">No payments received for this batch yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FinancialReports;
>>>>>>> master
