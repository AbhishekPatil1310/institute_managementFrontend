<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import api from "../../services/api";

const Exams = () => {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [exams, setExams] = useState([]);

  // --- NEW: Master Subject States ---
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [form, setForm] = useState({
    name: "",
    examDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ------------------ Load initial data ------------------ */
  useEffect(() => {
    api
      .get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));

    fetchMasterSubjects();
  }, []);

  // --- NEW: Fetch Master Subjects ---
  const fetchMasterSubjects = async () => {
    try {
      const res = await api.get("/api/admin/subjects");
      setMasterSubjects(res.data);
    } catch (err) {
      console.error("Failed to load master subjects");
    }
  };

  /* ------------------ Load exams ------------------ */
  const fetchExams = async (id) => {
    setExams([]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/admin/batches/${id}/exams`);
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

  /* ------------------ NEW: Master Subject Handlers ------------------ */
  const handleAddMasterSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await api.post("/api/admin/subjects", { name: newSubjectName });
      setNewSubjectName("");
      fetchMasterSubjects();
    } catch (err) {
      alert(err?.response?.data?.message || "Error adding subject");
    }
  };

  const handleDeleteMasterSubject = async (id) => {
    if (!confirm("Delete this subject from master list?")) return;
    try {
      await api.delete(`/api/admin/subjects/${id}`);
      fetchMasterSubjects();
    } catch (err) {
      alert("Cannot delete subject. It might be linked to existing exams.");
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
        await api.post(`/api/admin/batches/${batchId}/exams`, {
          name: form.name,
          examDate: form.examDate,
        });
      }

      resetForm();
      fetchExams(batchId);
    } catch (err) {
      setError(err?.response?.data?.message || "Operation failed");
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
      alert(err?.response?.data?.message || "Cannot delete exam");
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Exams</h1>
        {/* NEW: Button to open Master Subject Modal */}
        <button
          onClick={() => setShowSubjectModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition"
        >
          Manage Master Subjects
        </button>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Batch selector */}
      <div className="mb-4 max-w-md">
        <label className="block mb-1 text-sm">Select Batch</label>
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
          className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl"
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

      {/* Table on medium and larger screens */}
      <div className="hidden md:block bg-white rounded shadow overflow-x-auto max-w-xl">
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
                <td className="p-2 border">{e.name}</td>
                <td className="p-2 border">{e.exam_date}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!exams.length && !loading && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No exams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on small screens */}
      <div className="md:hidden grid grid-cols-1 gap-4 max-w-xl">
        {exams.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <div className="flex space-x-2">
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
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                <strong>Exam Date:</strong> {e.exam_date}
              </p>
            </div>
          </div>
        ))}
        {!exams.length && !loading && (
          <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            No exams found
          </div>
        )}
      </div>

      {/* --- NEW: MASTER SUBJECT MODAL --- */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Master Subject List</h2>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleAddMasterSubject} className="flex gap-2 mb-4">
                <input
                  className="border p-2 flex-1 rounded outline-none focus:border-blue-500"
                  placeholder="Subject Name (e.g. Physics)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                />
                <button className="bg-blue-600 text-white px-4 rounded text-sm font-bold">
                  Add
                </button>
              </form>

              <div className="max-h-60 overflow-y-auto border rounded divide-y">
                {masterSubjects.length > 0 ? (
                  masterSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 transition"
                    >
                      <span className="text-gray-700">{sub.name}</span>
                      <button
                        onClick={() => handleDeleteMasterSubject(sub.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete Subject"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-gray-400 text-sm">
                    No subjects in list.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t text-right">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
>>>>>>> master
