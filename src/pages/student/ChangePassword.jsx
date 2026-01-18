import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    try {
      await api.post("/api/student/change-password", {
        password,
      });
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Password change failed"
      );
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">
        Change Password
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      <form
        onSubmit={submit}
        className="bg-white p-4 rounded shadow space-y-3"
      >
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
