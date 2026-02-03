import { useState } from "react";
import api from "../../services/api";

const DTPMarksEntry = () => {
  const [step, setStep] = useState(1); // 1: Search, 2: Subjects, 3: Marks
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  // Master list of all possible subjects
  const [masterSubjects, setMasterSubjects] = useState([]);
  // Subjects chosen / loaded for THIS exam (authoritative)
  const [chosenSubjects, setChosenSubjects] = useState([]);

  const [students, setStudents] = useState([]);
  const [marksGrid, setMarksGrid] = useState({});
  const [loading, setLoading] = useState(false);

  // --- STEP 1: SEARCH EXAMS ---
  const handleSearch = async () => {
    try {
      const res = await api.get(`/api/dtp/exams/search?term=${searchTerm}`);
      setExams(res.data);
    } catch {
      alert("Error searching exams");
    }
  };

  // --- STEP 2: SETUP SUBJECTS ---
  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    try {
      const res = await api.get("/api/dtp/subjects");
      setMasterSubjects(res.data);
      setChosenSubjects([]); // reset
      setStep(2);
    } catch {
      alert("Could not load master subjects list");
    }
  };

  const addSubjectToExam = (subjectId) => {
    const subject = masterSubjects.find((s) => s.id === subjectId);
    if (subject && !chosenSubjects.find((s) => s.subject_id === subjectId)) {
      setChosenSubjects((prev) => [
        ...prev,
        { subject_id: subject.id, name: subject.name, max_marks: 100 },
      ]);
    }
  };

  const handleMaxMarksChange = (subId, value) => {
    setChosenSubjects((prev) =>
      prev.map((s) =>
        s.subject_id === subId
          ? { ...s, max_marks: parseInt(value) || 0 }
          : s
      )
    );
  };

  // --- STEP 3: MARKS ENTRY ---
  const proceedToMarksEntry = async () => {
    if (chosenSubjects.length === 0) {
      alert("Please add at least one subject");
      return;
    }

    setLoading(true);
    try {
      // 1. Save subject blueprint
      await api.post(`/api/dtp/exams/${selectedExam.id}/subjects`, {
        subjects: chosenSubjects.map((s) => ({
          subjectId: s.subject_id,
          maxMarks: s.max_marks,
        })),
      });

      // 2. Fetch entry sheet (AUTHORITATIVE DATA)
      const res = await api.get(
        `/api/dtp/marks/entry-sheet?examId=${selectedExam.id}&batchId=${selectedExam.batch_id}`
      );

      setStudents(res.data.students);

      // 🔥 CRITICAL FIX: overwrite subjects from backend config
      setChosenSubjects(res.data.subjects);

      // Initialize marks grid
      const initialMarks = {};
      res.data.existingMarks.forEach((m) => {
        if (!initialMarks[m.student_id]) initialMarks[m.student_id] = {};
        initialMarks[m.student_id][m.subject_id] = m.marks_obtained;
      });
      setMarksGrid(initialMarks);

      setStep(3);
    } catch {
      alert("Failed to initialize mark sheet");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInput = (studentId, subjectId, value) => {
    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: value,
      },
    }));
  };

  const markAbsent = (studentId) => {
    const zeroMarks = {};
    chosenSubjects.forEach((s) => {
      zeroMarks[s.subject_id] = 0;
    });
    setMarksGrid((prev) => ({ ...prev, [studentId]: zeroMarks }));
  };

  const submitMarks = async () => {
    const marksData = [];

    Object.keys(marksGrid).forEach((studentId) => {
      Object.keys(marksGrid[studentId]).forEach((subjectId) => {
        marksData.push({
          studentId,
          subjectId,
          marks: marksGrid[studentId][subjectId],
        });
      });
    });

    try {
      await api.post("/api/dtp/marks/submit", {
        examId: selectedExam.id,
        marksData,
      });
      alert("Marks saved successfully!");
      setStep(1);
      setSelectedExam(null);
      setChosenSubjects([]);
      setMarksGrid({});
    } catch {
      alert("Failed to save marks");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold border-b pb-4 mb-6">
        DTP Marks Entry
      </h1>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="border p-2 flex-1 rounded"
              placeholder="Search Exam Name or Date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Search
            </button>
          </div>

          <div className="border rounded divide-y">
            {exams.map((e) => (
              <div
                key={e.id}
                className="p-3 flex justify-between items-center hover:bg-gray-50"
              >
                <span>
                  {e.name} (
                  {new Date(e.exam_date).toLocaleDateString()})
                </span>
                <button
                  onClick={() => handleSelectExam(e)}
                  className="text-blue-600 font-bold"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Add Subjects for: {selectedExam?.name}
          </h3>

          <select
            className="border p-2 w-full rounded"
            value=""
            onChange={(e) => addSubjectToExam(e.target.value)}
          >
            <option value="">-- Choose Subject to Add --</option>
            {masterSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {chosenSubjects.map((s) => (
            <div
              key={s.subject_id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded border"
            >
              <span className="font-medium">{s.name}</span>
              <input
                type="number"
                className="border w-20 p-1 text-center rounded"
                value={s.max_marks}
                onChange={(e) =>
                  handleMaxMarksChange(s.subject_id, e.target.value)
                }
              />
            </div>
          ))}

          <button
            onClick={proceedToMarksEntry}
            className="bg-green-600 text-white px-6 py-2 rounded font-bold w-full"
          >
            {loading ? "Processing..." : "Configure & Enter Marks"}
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                {chosenSubjects.map((s) => (
                  <th key={s.subject_id} className="p-3 text-center">
                    {s.name}
                    <br />
                    <span className="text-gray-400">
                      Max: {s.max_marks}
                    </span>
                  </th>
                ))}
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.student_id}>
                  <td className="p-3">{st.student_name}</td>
                  {chosenSubjects.map((sub) => (
                    <td key={sub.subject_id} className="p-3">
                      <input
                        type="number"
                        className="w-16 mx-auto block border rounded p-1 text-center"
                        value={
                          marksGrid[st.student_id]?.[sub.subject_id] ?? ""
                        }
                        onChange={(e) =>
                          handleMarkInput(
                            st.student_id,
                            sub.subject_id,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => markAbsent(st.student_id)}
                      className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold"
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={submitMarks}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Save All Marks
          </button>
        </div>
      )}
    </div>
  );
};

export default DTPMarksEntry;
