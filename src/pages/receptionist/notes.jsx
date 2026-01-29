import { useEffect, useState } from "react";
import api from "../../services/api";
import { Search, Plus, BookOpen, User, Calendar, Layers } from "lucide-react";

const Notes = () => {
  // --- Data State ---
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [gridData, setGridData] = useState([]); // Array of { subject_id, subject_name, notes: [] }

  // --- Selection State ---
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Batches (Using your admin route pattern)
  useEffect(() => {
    api
      .get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setError("Failed to load batches"));
  }, []);

  // 2. Fetch Students when Batch or Search changes (Debounced)
  useEffect(() => {
    if (!selectedBatchId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await api.get(`/api/reception/batch/${selectedBatchId}/students?search=${search}`);
        setStudents(res.data.data || []);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };

    const delayDebounce = setTimeout(fetchStudents, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedBatchId]);

  // 3. Load the Notes Grid for the selected student
  const loadGrid = async (student) => {
    setLoading(true);
    setSelectedStudent(student);
    setError(null);
    try {
      const res = await api.get(`/api/reception/grid?studentId=${student.id}&batchId=${selectedBatchId}`);
      setGridData(res.data.data);
    } catch (err) {
      setError("Failed to load notes history");
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit New Note (Optimistic Update)
  const handleAddNote = async (subjectId, subjectName) => {
    const noteTitle = prompt(`Enter note content for ${subjectName}:`);
    if (!noteTitle) return;

    // Optimistic UI update
    const tempNote = { note_content_name: noteTitle, issued_at: new Date() };
    setGridData(prev => prev.map(row => 
      row.subject_id === subjectId 
        ? { ...row, notes: [tempNote, ...row.notes] } 
        : row
    ));

    try {
      await api.post("/api/reception/add", {
        studentId: selectedStudent.id,
        batchId: selectedBatchId,
        subjectId,
        noteTitle
      });
    } catch (err) {
      alert("Failed to save note to server. Please refresh.");
      loadGrid(selectedStudent); // Revert to server state
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20}/> Issue Notes
          </h2>
          
          {/* Batch Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Batch</label>
            <select 
              className="w-full border px-3 py-2 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setSelectedStudent(null);
                setGridData([]);
              }}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Student Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search student..."
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
              disabled={!selectedBatchId}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Student List */}
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {selectedStudent ? (
          <>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h1>
                <p className="text-gray-500 text-sm">Batch ID: {selectedBatchId} | Code: {selectedStudent.student_code}</p>
              </div>
              {loading && <span className="text-sm text-blue-600 animate-pulse">Loading records...</span>}
            </div>

            {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded text-sm">{error}</p>}

            {/* THE HORIZONTAL GRID */}
            <div className="bg-white rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr className="text-left">
                      <th className="p-4 w-40 sticky left-0 bg-gray-100 border-r text-xs font-bold text-gray-600">SUBJECT</th>
                      <th className="p-4 text-xs font-bold text-gray-600">NOTES TIMELINE (NEWEST FIRST)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row) => (
                      <tr key={row.subject_id} className="border-b last:border-0">
                        {/* Fixed Subject Cell */}
                        <td className="p-4 font-bold text-gray-700 bg-white sticky left-0 border-r shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-sm">
                          {row.subject_name}
                        </td>
                        
                        {/* Horizontal Scroll Area */}
                        <td className="p-4">
                          <div className="flex gap-3 items-center">
                            {/* Action Button */}
                            <button 
                              onClick={() => handleAddNote(row.subject_id, row.subject_name)}
                              className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
                            >
                              <Plus size={20}/>
                            </button>

                            {/* Note Cards */}
                            {row.notes.map((note, idx) => (
                              <div key={idx} className="flex-shrink-0 w-44 p-3 bg-blue-50/50 border border-blue-100 rounded-lg relative group">
                                <p className="text-xs font-bold text-blue-900 truncate">{note.note_content_name}</p>
                                <div className="flex items-center gap-1 mt-1 text-[9px] text-blue-400 uppercase font-medium">
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <User size={80} strokeWidth={1} />
            <p className="mt-4 font-medium">Select a student to manage issued notes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;