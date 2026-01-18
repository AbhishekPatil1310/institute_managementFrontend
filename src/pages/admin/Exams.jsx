import { useEffect, useState } from "react";
import api from "../../services/api";

const Exams = () => {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [exams, setExams] = useState([]);

  const [form, setForm] = useState({
    name: "",
    examDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ------------------ Load batches ------------------ */
  useEffect(() => {
    api
      .get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  /* ------------------ Load exams ------------------ */
  const fetchExams = async (id) => {
    setExams([]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(
        `/api/admin/batches/${id}/exams`
      );
      setExams(res.data);
    } catch {
      setError("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const id = e.target.value;
    setBatchId(id);
    setEditingId(null);
    setForm({ name: "", examDate: "" });

    if (id) fetchExams(id);
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
    setForm({ name: "", examDate: "" });
  };

  /* ------------------ Create / Update ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await api.put(`/api/admin/exams/${editingId}`, {
          name: form.name,
          examDate: form.examDate,
        });
      } else {
        await api.post(
          `/api/admin/batches/${batchId}/exams`,
          {
            name: form.name,
            examDate: form.examDate,
          }
        );
      }

      resetForm();
      fetchExams(batchId);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  /* ------------------ Edit ------------------ */
  const handleEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      name: exam.name,
      examDate: exam.exam_date,
    });
  };

  /* ------------------ Delete ------------------ */
  const handleDelete = async (id) => {
    if (!confirm("Delete this exam?")) return;

    try {
      await api.delete(`/api/admin/exams/${id}`);
      fetchExams(batchId);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Cannot delete exam"
      );
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Exams
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {/* Batch selector */}
      <div className="mb-4 max-w-md">
        <label className="block mb-1 text-sm">
          Select Batch
        </label>
        <select
          value={batchId}
          onChange={handleBatchChange}
          className="border px-3 py-2 rounded w-full"
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
          <input
            name="name"
            placeholder="Exam name"
            value={form.name}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />

          <input
            name="examDate"
            type="date"
            value={form.examDate}
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
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Exam Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td className="p-2 border">
                    {e.name}
                  </td>
                  <td className="p-2 border">
                    {e.exam_date}
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(e)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!exams.length && !loading && (
                <tr>
                  <td
                    colSpan="3"
                    className="p-4 text-center text-gray-500"
                  >
                    No exams found
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

export default Exams;
