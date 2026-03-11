import { useEffect, useState } from "react";
import api from "../../services/api";
import { BookOpen, Calendar, CheckCircle, Info, Layers, Loader2 } from "lucide-react";

const MyNotes = () => {
  const [batches, setBatches] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [ackSaving, setAckSaving] = useState(false);
  const [processingNoteId, setProcessingNoteId] = useState(null);
  const [error, setError] = useState(null);

  // 1. Fetch Batches
  useEffect(() => {
    const fetchMyBatches = async () => {
      try {
        const res = await api.get("/api/students/students/batches");
        
        // FIX: Your backend returns the array directly, not wrapped in {data: {data: []}}
        // So we use res.data directly.
        const batchList = res.data.batches || [];
        setBatches(batchList);
        // FIX: Use 'batchId' alias from your SQL query
        if (batchList.length > 0) {
          setSelectedBatchId(batchList[0].batchId);
        }
      } catch (err) {
        setError("Failed to load your enrolled batches.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBatches();
  }, []);

  // 2. Fetch Notes whenever selectedBatchId changes
  useEffect(() => {
    if (!selectedBatchId) return;

    const fetchMyNotes = async () => {
      setNotesLoading(true);
      try {
        const res = await api.get(`/api/notes/my-notes?batchId=${selectedBatchId}`);
        // If your notes route also returns the array directly, adjust here:
        setGridData(res.data.data || res.data || []);
      } catch (err) {
        setError("Could not load notes for the selected batch.");
      } finally {
        setNotesLoading(false);
      }
    };
    fetchMyNotes();
  }, [selectedBatchId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  const handleAcknowledgeNote = async (noteId) => {
    setAckSaving(true);
    setProcessingNoteId(noteId);
    setError(null);
    try {
      await api.patch("/api/notes/my-notes/acknowledge", { noteIds: [noteId] });
      setGridData((prev) =>
        prev.map((subject) => ({
          ...subject,
          notes: subject.notes.map((note) =>
            note.id === noteId
              ? { ...note, is_acknowledged: true, acknowledged_at: new Date().toISOString() }
              : note
          ),
        }))
      );
    } catch (err) {
      setError("Could not mark note as received. Please try again.");
    } finally {
      setAckSaving(false);
      setProcessingNoteId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-green-600" /> My Issued Notes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Select a batch to view your issued study materials.</p>
        </div>

        {/* Batch Selector */}
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Layers className="absolute left-3 top-3 text-gray-400" size={16} />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none appearance-none font-medium text-gray-700 transition-all"
            >
              <option value="">Choose Batch...</option>
              {batches.map((batch) => (
                /* FIX: Using aliases 'batchId' and 'batchName' from your SQL query */
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchName}
                </option>
              ))}
            </select>
          </div>

        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
          <Info size={18} /> {error}
        </div>
      )}

      {notesLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : (
        <div className="space-y-6">
          {gridData.length > 0 ? (
            gridData.map((subject) => (
              <div key={subject.subject_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 uppercase tracking-wider text-xs md:text-sm">
                    {subject.subject_name}
                  </h3>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {subject.notes.length} {subject.notes.length === 1 ? 'Note' : 'Notes'}
                  </span>
                </div>

                <div className="p-4">
                  {subject.notes.length > 0 ? (
                    <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                      {subject.notes.map((note, idx) => (
                        <div 
                          key={idx} 
                          className="flex-shrink-0 w-64 p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-1.5 rounded-lg ${note.is_acknowledged ? "bg-blue-50" : "bg-green-50"}`}>
                              <CheckCircle className={note.is_acknowledged ? "text-blue-600" : "text-green-600"} size={16} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {note.is_acknowledged && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  Received
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                               #{subject.notes.length - idx}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight mb-4 min-h-[40px]">
                            {note.note_content_name}
                          </p>
                          <div className="pt-3 border-t border-gray-50 flex items-center gap-2 text-gray-400 text-[10px]">
                            <Calendar size={12} />
                            Issued on: {new Date(note.issued_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </div>
                          {note.acknowledged_at && (
                            <div className="mt-2 text-[10px] text-blue-600 font-medium">
                              Received on: {new Date(note.acknowledged_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </div>
                          )}
                          {!note.is_acknowledged && (
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeNote(note.id)}
                              disabled={ackSaving && processingNoteId === note.id}
                              className="mt-3 w-full rounded-md bg-green-600 text-white text-xs font-semibold py-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {ackSaving && processingNoteId === note.id ? "Saving..." : "Mark as Received"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-gray-400 text-xs italic">
                      No notes issued for this subject yet.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Layers className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">No records found for this selection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyNotes;
