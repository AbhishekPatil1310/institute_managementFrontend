import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Search,
  Plus,
  BookOpen,
  User,
  Calendar,
  Menu,
  X,
} from "lucide-react";

const Notes = () => {
  /* ========================
     Data State
  ======================== */
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [gridData, setGridData] = useState([]);

  /* ========================
     UI State
  ======================== */
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ========================
     Fetch Batches
  ======================== */
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/api/admin/batches");
        setBatches(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load batches");
      }
    };

    fetchBatches();
  }, []);

  /* ========================
     Fetch Students
  ======================== */
  const fetchStudents = async () => {
    if (!selectedBatchId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(
        `/api/notes/batch/${selectedBatchId}/students?search=${searchInput}`
      );

      const list = res.data.data || [];

      setStudents(list);

      if (window.innerWidth < 768 && list.length) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Load Notes Grid
  ======================== */
  const loadGrid = async (student) => {
    if (!student) return;

    try {
      setLoading(true);
      setError(null);

      setSelectedStudent(student);

      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }

      const res = await api.get(
        `/api/notes/grid?studentId=${student.id}&batchId=${selectedBatchId}`
      );

      setGridData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load notes history");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     Add Note
  ======================== */
  const handleAddNote = async (subjectId, subjectName) => {
    const noteText = window.prompt(
      `Enter note for ${subjectName}:`
    );

    if (!noteText?.trim()) return;

    const tempNote = {
      note_content_name: noteText,
      issued_at: new Date(),
    };

    // Optimistic UI
    setGridData((prev) =>
      prev.map((row) =>
        row.subject_id === subjectId
          ? {
              ...row,
              notes: [tempNote, ...row.notes],
            }
          : row
      )
    );

    try {
      await api.post("/api/notes/add", {
        studentId: selectedStudent.id,
        batchId: selectedBatchId,
        subjectId,
        noteTitle: noteText,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to save note");
      loadGrid(selectedStudent);
    }
  };

  /* ========================
     Reset on Batch Change
  ======================== */
  useEffect(() => {
    setStudents([]);
    setGridData([]);
    setSelectedStudent(null);
  }, [selectedBatchId]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">

      {/* ========================
          Mobile Toggle
      ======================== */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden absolute bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* ========================
          Sidebar
      ======================== */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform duration-300
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">

          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-3 bg-white">

            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="text-blue-600" size={20} />
              Issue Notes
            </h2>

            <select
              className="w-full border px-3 py-2 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">Select Batch</option>

              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="flex gap-2">

              <div className="relative flex-1">

                <Search
                  className="absolute left-2 top-2.5 text-gray-400"
                  size={14}
                />

                <input
                  type="text"
                  placeholder="Student..."
                  className="w-full pl-8 pr-2 py-2 border rounded-md text-sm outline-none focus:border-blue-400"
                  value={searchInput}
                  disabled={!selectedBatchId}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && fetchStudents()
                  }
                />
              </div>

              <button
                onClick={fetchStudents}
                disabled={!selectedBatchId || loading}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition"
              >
                <Search size={16} />
              </button>
            </div>

          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto">

            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => loadGrid(s)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition
                  ${
                    selectedStudent?.id === s.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
              >
                <p className="font-semibold text-gray-800 text-sm">
                  {s.name}
                </p>

                <p className="text-xs text-gray-500">
                  {s.phone}
                </p>
              </button>
            ))}

            {!loading && students.length === 0 && (
              <p className="text-center text-sm text-gray-400 p-6">
                No students found
              </p>
            )}

          </div>
        </div>
      </div>

      {/* ========================
          Main Content
      ======================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-sm border-b">
            {error}
          </div>
        )}

        {selectedStudent ? (
          <div className="flex flex-col h-full p-4 md:p-6 lg:p-8">

            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">

              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  {selectedStudent.name}
                </h1>

                <p className="text-gray-500 text-xs md:text-sm">
                  Code: {selectedStudent.student_code} | Batch:{" "}
                  {selectedBatchId}
                </p>
              </div>

              {loading && (
                <span className="text-xs text-blue-600 animate-pulse font-medium">
                  Processing...
                </span>
              )}

            </header>

            {/* Notes Table */}
            <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">

              <div className="overflow-auto flex-1">

                <table className="w-full border-collapse min-w-[600px]">

                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr className="text-left border-b">
                      <th className="p-4 w-40 sticky left-0 bg-gray-100 border-r text-xs font-bold text-gray-600">
                        SUBJECT
                      </th>

                      <th className="p-4 text-xs font-bold text-gray-600">
                        NOTES
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {gridData.map((row) => (
                      <tr
                        key={row.subject_id}
                        className="border-b last:border-0"
                      >
                        <td className="p-4 font-bold text-gray-700 bg-white sticky left-0 border-r text-xs md:text-sm">
                          {row.subject_name}
                        </td>

                        <td className="p-4">

                          <div className="flex gap-3 items-center">

                            {/* Add Button */}
                            <button
                              onClick={() =>
                                handleAddNote(
                                  row.subject_id,
                                  row.subject_name
                                )
                              }
                              className="flex-shrink-0 w-9 h-9 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition bg-white"
                            >
                              <Plus size={18} />
                            </button>

                            {/* Notes */}
                            {row.notes.map((note, idx) => (
                              <div
                                key={idx}
                                className="flex-shrink-0 w-36 md:w-44 p-2 md:p-3 bg-blue-50 border border-blue-100 rounded-lg"
                              >
                                <p className="text-xs font-bold text-blue-900 truncate">
                                  {note.note_content_name}
                                </p>

                                <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400 uppercase font-medium">
                                  <Calendar size={10} />
                                  {new Date(
                                    note.issued_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            ))}

                          </div>

                        </td>
                      </tr>
                    ))}

                    {!loading && gridData.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          className="p-10 text-center text-gray-400"
                        >
                          No notes available
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <User size={64} strokeWidth={1} />
            <p className="mt-4 font-medium">
              Select a batch and student
            </p>
          </div>
        )}
      </main>

      {/* ========================
          Mobile Overlay
      ======================== */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

    </div>
  );
};

export default Notes;
