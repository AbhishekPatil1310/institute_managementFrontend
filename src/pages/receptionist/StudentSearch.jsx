import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentSearch = () => {
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const search = async () => {
    setError(null);
    try {
      const res = await api.get(
        `/api/reception/students/search?q=${phone}`
      );
      setStudents(res.data);
    } catch {
      setError("Student not found");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Student Search
      </h1>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={search}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {students.map((s) => (
        <div
          key={s.id}
          className="bg-white p-3 rounded shadow mb-2 flex justify-between"
        >
          <div>
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm text-gray-500">
              {s.phone}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/receptionist/admissions?studentId=${s.id}`
              )
            }
            className="text-blue-600"
          >
            Admit
          </button>
        </div>
      ))}
    </div>
  );
};

export default StudentSearch;
