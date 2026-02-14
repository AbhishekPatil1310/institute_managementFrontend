import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentSearch = () => {
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Inline Edit */
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  /* Expand Details */
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();

  /* ========================
     Search
  ======================== */
  const search = async () => {
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await api.get(
        `/api/reception/students/search?q=${phone}`
      );

      const list = res.data.data || [];

      console.log("Backend Student Data:", list);

      setStudents(list);

      if (!list.length) {
        setError("No students found");
      }
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Edit Mode
  ======================== */
  const startEditing = (student) => {
    setEditingId(student.studentId || student.id);
    setNewName(student.studentName || student.name || "");
    setError(null);
    setSuccess(null);
  };

  /* ========================
     Update Name
  ======================== */
  const handleUpdateName = async (studentId) => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await api.patch(
        `/api/reception/students/${studentId}/name`,
        { name: newName }
      );

      setStudents((prev) =>
        prev.map((s) =>
          (s.studentId || s.id) === studentId
            ? { ...s, studentName: newName, name: newName }
            : s
        )
      );

      setEditingId(null);
      setSuccess("Name updated successfully");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to update name"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">

      <h1 className="text-xl font-semibold mb-6 text-gray-800">
        Student Search
      </h1>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          disabled={loading}
          className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />

        <button
          onClick={search}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded border-l-4 border-red-500 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded border-l-4 border-green-500 text-sm">
          {success}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {students.map((s) => {

          const studentId = s.studentId || s.id;
          const studentName = s.studentName || s.name;

          return (
            <div
              key={studentId}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start gap-4">

                <div className="flex-1">
                  {editingId === studentId ? (
                    <div className="flex gap-2">

                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border px-2 py-1 rounded w-full"
                        autoFocus
                      />

                      <button
                        onClick={() => handleUpdateName(studentId)}
                        className="text-green-600 font-semibold"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400"
                      >
                        Cancel
                      </button>

                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-gray-800">
                        {studentName}
                      </p>

                      <p className="text-sm text-gray-500 font-mono">
                        📞 {s.phone}
                      </p>
                    </>
                  )}
                </div>

                {/* Expand */}
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === studentId ? null : studentId
                    )
                  }
                  className="text-xs text-blue-600"
                >
                  {expandedId === studentId
                    ? "Hide Details"
                    : "View Details"}
                </button>

              </div>

              {/* Expanded Details */}
              {expandedId === studentId && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">

                  {s.email && <p>📧 {s.email}</p>}

                  {s.batchName && <p>🎓 Batch: {s.batchName}</p>}

                  {s.admission_status && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        s.admission_status === "Admitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.admission_status}
                    </span>
                  )}

                  {s.pendingBalance !== undefined && (
                    <p className="text-red-600 font-semibold">
                      Pending: ₹{s.pendingBalance}
                    </p>
                  )}

                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex gap-3 mt-4 border-t pt-3 flex-wrap">

                {/* Edit */}
                {editingId !== studentId && (
                  <button
                    onClick={() => startEditing(s)}
                    className="text-gray-500 hover:text-blue-600 text-sm"
                  >
                    Edit Name
                  </button>
                )}

                {/* Collect Fee (if admitted) */}
                {s.admission_status === "Admitted" && (
                  <button
                    onClick={() =>
                      navigate("/receptionist/payments", {
                        state: {
                          selectedStudent: {
                            admissionId: s.admissionId,
                            studentName,
                            batchName: s.batchName,
                            pendingBalance: s.pendingBalance,
                          },
                        },
                      })
                    }
                    className="bg-green-50 text-green-600 hover:bg-green-100 px-4 py-1.5 rounded font-semibold"
                  >
                    Collect Fee
                  </button>
                )}

                {/* Always Allow New Batch */}
                <button
                  onClick={() =>
                    navigate(
                      `/receptionist/admissions?studentId=${studentId}`
                    )
                  }
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded font-semibold"
                >
                  + Add New Batch
                </button>

              </div>
            </div>
          );
        })}

        {!loading && students.length === 0 && !error && (
          <p className="text-center text-gray-400 py-6">
            Search to find students
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
