import { useState, useEffect } from "react";
import api from "../../services/api";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newName, setNewName] = useState("");

  const fetchSubjects = async () => {
    const res = await api.get("/api/admin/subjects");
    setSubjects(res.data);
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await api.post("/api/admin/subjects", { name: newName });
      setNewName("");
      fetchSubjects();
    } catch (err) { alert("Error adding subject"); }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Master Subject List</h2>
      
      {/* Add Subject Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input 
          type="text" 
          className="border p-2 flex-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New Subject Name (e.g. Chemistry)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Add Subject</button>
      </form>

      {/* Subject List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map(s => (
          <div key={s.id} className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center group">
            <span className="font-medium text-gray-700">{s.name}</span>
            <span className="text-[10px] text-gray-400">ID: ...{s.id.slice(-4)}</span>
          </div>
        ))}
      </div>
      
      {subjects.length === 0 && (
        <p className="text-center text-gray-400 mt-4">No subjects added yet.</p>
      )}
    </div>
  );
};

export default Subjects;