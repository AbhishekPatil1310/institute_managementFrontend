import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentMarks = () => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState(null);

  useEffect(() => {
    api.get("/api/students/marks")
      .then((res) => {
        setExamResults(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleExam = (index) => {
    setExpandedExam(expandedExam === index ? null : index);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Fetching your results...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Academic Performance</h2>
        <p className="text-sm text-gray-500">View your marks and subject-wise breakdown</p>
      </header>

      {examResults.length > 0 ? (
        <div className="space-y-4">
          {examResults.map((exam, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
              {/* Exam Summary Header */}
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExam(idx)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {exam.batchName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(exam.examDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{exam.examName}</h3>
                </div>

                <div className="text-right mr-4">
                  <p className="text-2xl font-black text-indigo-700">{exam.percentage}%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aggregate</p>
                </div>

                <div className={`text-gray-400 transition-transform ${expandedExam === idx ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Subject Breakdown (Expandable) */}
              {expandedExam === idx && (
                <div className="border-t border-gray-50 bg-gray-50/50 p-5 animate-in slide-in-from-top-2 duration-300">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase text-gray-400 font-black border-b border-gray-200">
                        <td className="pb-2">Subject</td>
                        <td className="pb-2 text-center">Marks Obtained</td>
                        <td className="pb-2 text-center">Max Marks</td>
                        <td className="pb-2 text-right">Status</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {exam.subjectWiseMarks.map((sub, sIdx) => {
                        const isPass = (sub.marksObtained / sub.maxMarks) >= 0.4; // 40% Pass Criteria
                        return (
                          <tr key={sIdx} className="text-sm">
                            <td className="py-3 font-semibold text-gray-700">{sub.subjectName}</td>
                            <td className="py-3 text-center font-bold">{sub.marksObtained}</td>
                            <td className="py-3 text-center text-gray-500">{sub.maxMarks}</td>
                            <td className="py-3 text-right">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isPass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold text-gray-800 bg-white/50">
                        <td className="py-3">Grand Total</td>
                        <td className="py-3 text-center text-indigo-700">{exam.totalObtained}</td>
                        <td className="py-3 text-center">{exam.totalPossible}</td>
                        <td className="py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500 font-medium">No exam results have been published yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;