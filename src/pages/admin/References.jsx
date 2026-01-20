import { useEffect, useState } from "react";
import api from "../../services/api";

const References = () => {
  const [references, setReferences] = useState([]);
  const [form, setForm] = useState({
    name: "",
    concession: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReferences = async () => {
    try {
      const res = await api.get("/api/admin/references");
      setReferences(res.data);
    } catch {
      setError("Failed to load references");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({ name: "", concession: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.put(
          `/api/admin/references/${editingId}`,
          {
            name: form.name,
            concession: Number(form.concession),
          }
        );
      } else {
        await api.post("/api/admin/references", {
          name: form.name,
          concession: Number(form.concession),
        });
      }

      resetForm();
      fetchReferences();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  const handleEdit = (ref) => {
    setEditingId(ref.id);
    setForm({
      name: ref.name,
      concession: ref.concession,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this reference?")) return;

    try {
      await api.delete(`/api/admin/references/${id}`);
      fetchReferences();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Cannot delete reference"
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Approved References
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
      >
        <input
          name="name"
          placeholder="Reference name"
          value={form.name}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          name="concession"
          type="number"
          placeholder="Concession amount"
          value={form.concession}
          onChange={handleChange}
          required
          min="0"
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
      <div className="hidden md:block bg-white rounded shadow overflow-x-auto max-w-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Concession</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {references.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.name}</td>
                <td className="p-2 border">₹{r.concession}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!references.length && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No references found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on small screens */}
      <div className="md:hidden grid grid-cols-1 gap-4 max-w-xl">
        {references.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{r.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(r)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                <strong>Concession:</strong> ₹{r.concession}
              </p>
            </div>
          </div>
        ))}
        {!references.length && (
          <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            No references found
          </div>
        )}
      </div>
    </div>
  );
};

export default References;
