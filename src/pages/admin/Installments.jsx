<<<<<<< HEAD
import { useEffect, useState } from "react";
import api from "../../services/api";

const MONTH_OPTIONS = ["3", "6", "9"];

const Installments = () => {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [installments, setInstallments] = useState([]);

  const [form, setForm] = useState({
    months: "3",
    surcharge: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ------------------ Fetch batches ------------------ */
  useEffect(() => {
    api.get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ------------------ Fetch installments ------------------ */
  const fetchInstallments = async (id) => {
    setInstallments([]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(
        `/api/admin/installments/batches/${id}/installments`
      );
      setInstallments(res.data);
    } catch {
      setError("Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const id = e.target.value;
    setBatchId(id);
    setEditingId(null);
    setForm({ months: "3", surcharge: "" });

    if (id) {
      fetchInstallments(id);
    }
  };

  /* ------------------ Form helpers ------------------ */
  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ months: "3", surcharge: "" });
  };

  /* ------------------ Create / Update ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.put(
          `/api/admin/installments/${editingId}`,
          { surcharge: Number(form.surcharge) }
        );
      } else {
        await api.post(
          `/api/admin/batches/${batchId}/installments`,
          {
            months: form.months,
            surcharge: Number(form.surcharge),
          }
        );
      }

      resetForm();
      fetchInstallments(batchId);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  /* ------------------ Edit ------------------ */
  const handleEdit = (inst) => {
    setEditingId(inst.id);
    setForm({
      months: inst.months,
      surcharge: inst.surcharge,
    });
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = async (id) => {
    if (!confirm("Delete this installment plan?")) return;

    try {
      await api.delete(`/api/admin/installments/${id}`);
      fetchInstallments(batchId);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Cannot delete installment"
      );
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Installment Plans
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {/* Batch selector */}
      <div className="mb-4">
        <label className="block mb-1 text-sm">
          Select Batch
        </label>
        <select
          value={batchId}
          onChange={handleBatchChange}
          className="border px-3 py-2 rounded w-full max-w-md"
        >
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {batchId && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4 max-w-xl"
        >
          <select
            name="months"
            value={form.months}
            onChange={handleChange}
            disabled={!!editingId}
            className="border px-3 py-2 rounded disabled:bg-gray-100"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} Months
              </option>
            ))}
          </select>

          <input
            name="surcharge"
            type="number"
            placeholder="Surcharge"
            value={form.surcharge}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />

          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Table */}
      {batchId && (
        <div className="bg-white rounded shadow overflow-x-auto max-w-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Months</th>
                <th className="p-2 border">Surcharge</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((i) => (
                <tr key={i.id}>
                  <td className="p-2 border">
                    {i.months}
                  </td>
                  <td className="p-2 border">
                    ₹{i.surcharge}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(i.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!installments.length && !loading && (
                <tr>
                  <td
                    colSpan="3"
                    className="p-4 text-center text-gray-500"
                  >
                    No installment plans
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Installments;
=======
import { useEffect, useState } from "react";
import api from "../../services/api";

const MONTH_OPTIONS = ["3", "6", "9","NO Limit"];

const Installments = () => {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [installments, setInstallments] = useState([]);

  const [form, setForm] = useState({
    months: "3",
    surcharge: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ------------------ Fetch batches ------------------ */
  useEffect(() => {
    api.get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ------------------ Fetch installments ------------------ */
  const fetchInstallments = async (id) => {
    setInstallments([]);
    setLoading(true);
    setError(null);

    try {
      // FIXED: Path must match router prefix + route
      const res = await api.get(
        `/api/admin/installments/batches/${id}/installments`
      );
      setInstallments(res.data);
    } catch {
      setError("Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const id = e.target.value;
    setBatchId(id);
    resetForm();

    if (id) {
      fetchInstallments(id);
    }
  };

  /* ------------------ Form helpers ------------------ */
  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ months: "3", surcharge: "" });
  };

  /* ------------------ Create / Update ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        // FIXED: Using correctly prefixed path
        await api.put(
          `/api/admin/installments/installments/${editingId}`,
          { surcharge: Number(form.surcharge) }
        );
      } else {
        // FIXED: Added missing '/installments/' segment to match backend prefix
        await api.post(
          `/api/admin/installments/batches/${batchId}/installments`,
          {
            months: form.months,
            surcharge: Number(form.surcharge),
          }
        );
      }

      resetForm();
      fetchInstallments(batchId);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Operation failed"
      );
    }
  };

  /* ------------------ Edit ------------------ */
  const handleEdit = (inst) => {
    setEditingId(inst.id);
    setForm({
      months: inst.months,
      surcharge: inst.surcharge,
    });
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = async (id) => {
    if (!confirm("Delete this installment plan?")) return;

    try {
      // FIXED: Using correctly prefixed path
      await api.delete(`/api/admin/installments/installments/${id}`);
      fetchInstallments(batchId);
    } catch (err) {
      alert(
        err?.response?.data?.message || "Cannot delete installment"
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Installment Plans</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-100">
          {error}
        </div>
      )}

      {/* Batch selector */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Select Batch
        </label>
        <select
          value={batchId}
          onChange={handleBatchChange}
          className="border px-3 py-2 rounded w-full max-w-md bg-white shadow-sm"
        >
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {batchId && (
        <>
          {/* Form Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
            <h2 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">
              {editingId ? "Edit Plan" : "Add New Plan"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-bold">Duration</label>
                <select
                  name="months"
                  value={form.months}
                  onChange={handleChange}
                  disabled={!!editingId}
                  className="border px-3 py-2 rounded bg-white disabled:bg-gray-100 h-[42px]"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m} Months
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-bold">Surcharge (₹)</label>
                <input
                  name="surcharge"
                  type="number"
                  placeholder="0"
                  value={form.surcharge}
                  onChange={handleChange}
                  required
                  className="border px-3 py-2 rounded h-[42px]"
                />
              </div>

              <div className="col-span-2 flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingId ? "Update Plan" : "Create Plan"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                  <th className="px-6 py-4 border-b">Duration</th>
                  <th className="px-6 py-4 border-b">Surcharge</th>
                  <th className="px-6 py-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {installments.map((i) => (
                  <tr key={i.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {i.months} Months
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      ₹{parseFloat(i.surcharge).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {!installments.length && !loading && (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                      No installment plans configured for this batch.
                    </td>
                  </tr>
                )}
                {loading && (
                    <tr>
                      <td colSpan="3" className="px-6 py-10 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Installments;
>>>>>>> master
