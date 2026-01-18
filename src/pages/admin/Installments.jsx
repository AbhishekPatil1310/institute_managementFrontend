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
