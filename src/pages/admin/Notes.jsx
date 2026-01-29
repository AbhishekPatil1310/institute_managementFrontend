import { useEffect, useState } from "react";
import api from "../../services/api";
import { Search, Plus, BookOpen, User, Calendar, Menu, X, Edit2, Trash2 } from "lucide-react";

const AdminNotes = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    api.get("/api/admin/batches").then((res) => setBatches(res.data));
  }, []);

  const fetchStudents = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    const res = await api.get(`/api/notes/batch/${selectedBatchId}/students?search=${searchInput}`);
    setStudents(res.data.data || []);
    setLoading(false);
  };

  const loadGrid = async (student) => {
    setLoading(true);
    setSelectedStudent(student);
    const res = await api.get(`/api/notes/grid?studentId=${student.id}&batchId=${selectedBatchId}`);
    setGridData(res.data.data);
    setLoading(false);
  };

  // --- ADMIN ACTIONS ---
  
  const handleEditNote = async (noteId, currentTitle) => {
    const newTitle = prompt("Edit Note Content:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    try {
      await api.patch(`/api/notes/notes/${noteId}`, { noteTitle: newTitle });
      // Refresh grid
      loadGrid(selectedStudent);
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note record?")) return;

    try {
      await api.delete(`/api/notes/notes/${noteId}`);
      // Refresh grid
      loadGrid(selectedStudent);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleAddNote = async (subjectId) => {
    const title = prompt("Enter new note content:");
    if (!title) return;
    await api.post("/api/notes/add", {
      studentId: selectedStudent.id,
      batchId: selectedBatchId,
      subjectId,
      noteTitle: title
    });
    loadGrid(selectedStudent);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* SIDEBAR (Same as Reception) */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
            <div className="p-4 border-b space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-red-600">
                    <BookOpen size={20}/> Admin: Notes Control
                </h2>
                <select className="w-full border p-2 rounded text-sm" onChange={(e) => setSelectedBatchId(e.target.value)}>
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <input className="flex-1 border p-2 rounded text-sm" placeholder="Search..." onChange={(e) => setSearchInput(e.target.value)} />
                    <button className="bg-gray-800 text-white p-2 rounded" onClick={fetchStudents}><Search size={16}/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {students.map(s => (
                    <button key={s.id} onClick={() => loadGrid(s)} className={`w-full text-left p-4 border-b ${selectedStudent?.id === s.id ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}>
                        <p className="font-bold text-sm">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.phone}</p>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 p-4 lg:p-8">
        {selectedStudent ? (
          <div className="flex flex-col h-full">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">Admin Portal: {selectedStudent.name}</h1>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold uppercase">Management Mode</span>
            </header>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr className="text-left border-b">
                      <th className="p-4 w-40 sticky left-0 bg-gray-100 border-r text-xs font-bold text-gray-600">SUBJECT</th>
                      <th className="p-4 text-xs font-bold text-gray-600">ACTIONABLE TIMELINE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row) => (
                      <tr key={row.subject_id} className="border-b last:border-0 group">
                        <td className="p-4 font-bold text-gray-700 bg-white sticky left-0 border-r shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-sm">
                          {row.subject_name}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3 items-center">
                            <button onClick={() => handleAddNote(row.subject_id)} className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500"><Plus/></button>
                            
                            {row.notes.map((note) => (
                              <div key={note.id} className="flex-shrink-0 w-48 p-3 bg-white border border-gray-200 rounded-lg shadow-sm group/card relative">
                                {/* ADMIN ACTIONS OVERLAY */}
                                <div className="absolute top-1 right-1 hidden group-hover/card:flex gap-1">
                                    <button onClick={() => handleEditNote(note.id, note.note_content_name)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Edit2 size={12}/></button>
                                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={12}/></button>
                                </div>

                                <p className="text-xs font-bold text-gray-800 truncate pr-8">{note.note_content_name}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">{new Date(note.issued_at).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-center"><User size={80}/><p className="mt-4">Select student to manage records</p></div>
        )}
      </main>
    </div>
  );
};

export default AdminNotes;