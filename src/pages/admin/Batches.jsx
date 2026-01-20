import { useEffect, useState } from "react";
import api from "../../services/api";

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    baseFee: "",
    startDate: "",
    endDate: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchBatches = async () => {
    try {
      const res = await api.get("/api/admin/batches");
      setBatches(res.data);
    } catch {
      setError("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      baseFee: "",
      startDate: "",
      endDate: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.put(`/api/admin/batches/${editingId}`, {
          name: form.name,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
      } else {
        await api.post("/api/admin/batches", {
          name: form.name,
          baseFee: Number(form.baseFee),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
      }

      resetForm();
      fetchBatches();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  const handleEdit = (batch) => {
    setEditingId(batch.id);
    setForm({
      name: batch.name,
      baseFee: batch.base_fee,
      startDate: batch.start_date || "",
      endDate: batch.end_date || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this batch?")) return;

    try {
      await api.delete(`/api/admin/batches/${id}`);
      fetchBatches();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Cannot delete batch"
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Batches
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          name="name"
          placeholder="Batch name"
          value={form.name}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          name="baseFee"
          type="number"
          placeholder="Base fee"
          value={form.baseFee}
          onChange={handleChange}
          required={!editingId}
          disabled={!!editingId}
          className="border px-3 py-2 rounded disabled:bg-gray-100"
        />

        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />

        <input
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
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

      {/* Table on medium and larger screens */}
      <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Base Fee</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className="p-2 border">{b.name}</td>
                <td className="p-2 border">₹{b.base_fee}</td>
                <td className="p-2 border">{b.start_date || "-"}</td>
                <td className="p-2 border">{b.end_date || "-"}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!batches.length && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No batches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on small screens */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{b.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(b)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                <strong>Base Fee:</strong> ₹{b.base_fee}
              </p>
              <p>
                <strong>Start Date:</strong> {b.start_date || "-"}
              </p>
              <p>
                <strong>End Date:</strong> {b.end_date || "-"}
              </p>
            </div>
          </div>
        ))}
        {!batches.length && (
          <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            No batches found
          </div>
        )}
      </div>
    </div>
  );
};

export default Batches;
