import { Link } from "react-router-dom";

const DTPDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, DTP Operator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-2">Quick Marks Entry</h2>
          <p className="text-gray-500 text-sm mb-4">
            Search for an exam, configure subjects, and enter student marks.
          </p>
          <Link 
            to="/dtp/marks-entry" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Start Entry
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-2">Instructions</h2>
          <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
            <li>Search exams by name or date.</li>
            <li>Ensure "Max Marks" are set before entering student scores.</li>
            <li>Use the "Absent" button to auto-fill zeros for missing students.</li>
            <li>Always click "Save All Marks" before leaving the page.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DTPDashboard;