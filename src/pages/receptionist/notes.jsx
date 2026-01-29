import { useEffect, useState } from "react";
import api from "../../services/api";
import { Search, Plus, BookOpen, User, Calendar, Menu, X } from "lucide-react";

const Notes = () => {
  // --- Data State ---
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [gridData, setGridData] = useState([]);

  // --- UI/Selection State ---
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Toggle for mobile

  // Fetch Batches
  useEffect(() => {
    api.get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  // Explicit Search Function
  const fetchStudents = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/notes/batch/${selectedBatchId}/students?search=${searchInput}`);
      setStudents(res.data.data || []);
      // Auto-close sidebar on mobile after selecting/searching if needed
      if(window.innerWidth < 768 && students.length > 0) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrid = async (student) => {
    setLoading(true);
    setSelectedStudent(student);
    if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close sidebar on mobile/tablet after selection
    try {
      const res = await api.get(`/api/notes/grid?studentId=${student.id}&batchId=${selectedBatchId}`);
      setGridData(res.data.data);
    } catch (err) {
      setError("Failed to load notes history");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (subjectId, subjectName) => {
    const noteTitle = prompt(`Enter note content for ${subjectName}:`);
    if (!noteTitle) return;

    const tempNote = { note_content_name: noteTitle, issued_at: new Date() };
    setGridData(prev => prev.map(row => 
      row.subject_id === subjectId ? { ...row, notes: [tempNote, ...row.notes] } : row
    ));

    try {
      await api.post("/api/notes/add", {
        studentId: selectedStudent.id,
        batchId: selectedBatchId,
        subjectId,
        noteTitle
      });
    } catch (err) {
      alert("Failed to save. Reverting...");
      loadGrid(selectedStudent);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* MOBILE HAMBURGER */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden absolute bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full shadow-sm">
          <div className="p-4 border-b space-y-3 bg-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="text-blue-600" size={20}/> Issue Notes
            </h2>
            
            <select 
              className="w-full border px-3 py-2 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Student..."
                  className="w-full pl-8 pr-2 py-2 border rounded-md text-sm outline-none focus:border-blue-400"
                  value={searchInput}
                  disabled={!selectedBatchId}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                />
              </div>
              <button 
                onClick={fetchStudents}
                disabled={!selectedBatchId}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {students.map(s => (
              <button 
                key={s.id}
                onClick={() => loadGrid(s)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${selectedStudent?.id === s.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                <p className="text-xs text-gray-500">{s.phone}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">
        {selectedStudent ? (
          <div className="flex flex-col h-full p-4 md:p-6 lg:p-8">
            <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{selectedStudent.name}</h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">Code: {selectedStudent.student_code} | {selectedBatchId}</p>
              </div>
              {loading && <span className="text-xs text-blue-600 animate-pulse font-medium">Processing...</span>}
            </header>

            {/* RESPONSIVE TABLE CONTAINER */}
            <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr className="text-left border-b">
                      <th className="p-4 w-32 md:w-40 sticky left-0 bg-gray-100 border-r text-xs font-bold text-gray-600">SUBJECT</th>
                      <th className="p-4 text-xs font-bold text-gray-600">NOTES TIMELINE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row) => (
                      <tr key={row.subject_id} className="border-b last:border-0 group">
                        <td className="p-4 font-bold text-gray-700 bg-white sticky left-0 border-r shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-xs md:text-sm">
                          {row.subject_name}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3 items-center overflow-x-visible">
                            <button 
                              onClick={() => handleAddNote(row.subject_id, row.subject_name)}
                              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white"
                            >
                              <Plus size={18}/>
                            </button>

                            {row.notes.map((note, idx) => (
                              <div key={idx} className="flex-shrink-0 w-36 md:w-44 p-2 md:p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <p className="text-[11px] md:text-xs font-bold text-blue-900 truncate">{note.note_content_name}</p>
                                <div className="flex items-center gap-1 mt-1 text-[8px] md:text-[10px] text-blue-400 uppercase font-medium">
                                  <Calendar size={10}/> {new Date(note.issued_at).toLocaleDateString()}
                                </div>
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
            <User size={64} className="md:w-20 md:h-20" strokeWidth={1} />
            <p className="mt-4 font-medium text-sm md:text-base">Select a batch and student to manage notes</p>
          </div>
        )}
      </main>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
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