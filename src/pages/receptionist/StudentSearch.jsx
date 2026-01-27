import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentSearch = () => {
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  
  // States for the Inline Edit functionality
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  
  const navigate = useNavigate();

  const search = async () => {
    if (!phone) return;
    setError(null);
    try {
      const res = await api.get(`/api/reception/students/search?q=${phone}`);
      setStudents(res.data);
      if (res.data.length === 0) setError("No students found matching that number.");
    } catch (err) {
      setError("Search failed. Please try again.");
    }
  };

  const startEditing = (student) => {
    setEditingId(student.id);
    setNewName(student.name);
  };

  const handleUpdateName = async (studentId) => {
    if (!newName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      // Calls the PATCH route we discussed earlier
      await api.patch(`/api/reception/students/${studentId}/name`, { 
        name: newName 
      });

      // Update the UI locally so we don't need to re-fetch from the server
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, name: newName } : s))
      );
      
      setEditingId(null);
      alert("Name updated successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update name");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Student Search</h1>

      {/* Search Input Section */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={search}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mb-4 bg-red-50 p-2 rounded">{error}</p>}

      {/* Results List */}
      <div className="space-y-3">
        {students.map((s) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex-1 w-full">
              {editingId === s.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border px-2 py-1 rounded w-full focus:ring-1 focus:ring-green-500"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleUpdateName(s.id)}
                    className="text-green-600 font-semibold hover:text-green-700 px-2"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-gray-600 px-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-bold text-gray-800 text-lg">{s.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{s.phone}</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
              {editingId !== s.id && (
                <button
                  onClick={() => startEditing(s)}
                  className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  Edit Name
                </button>
              )}
              
              <button
                onClick={() => navigate(`/receptionist/admissions?studentId=${s.id}`)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded font-semibold transition-colors"
              >
                Admit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSearch;