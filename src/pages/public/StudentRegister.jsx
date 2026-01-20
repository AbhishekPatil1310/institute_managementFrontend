import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post("/api/auth/student/register", form);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <form
        onSubmit={submit}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-text-primary">
          Register for Admission
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-100 p-3 rounded-lg">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Full Name
          </label>
          <input
            name="name"
            placeholder="John Doe"
            onChange={handleChange}
            className="w-full border border-neutral-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            onChange={handleChange}
            className="w-full border border-neutral-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Mobile Number
          </label>
          <input
            name="phone"
            placeholder="123-456-7890"
            onChange={handleChange}
            className="w-full border border-neutral-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;
