import { useEffect, useState } from "react";
import api from "../../services/api";

const ROLES = ["RECEPTIONIST", "DIRECTOR", "STUDENT"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "RECEPTIONIST",
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post("/api/admin/users", form);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "User creation failed"
      );
    }
  };

  const toggleUser = async (user) => {
    const action = user.is_active ? "disable" : "enable";

    if (
      !confirm(
        `${action === "disable" ? "Disable" : "Enable"} this user?`
      )
    )
      return;

    try {
      await api.patch(
        `/api/admin/users/${user.id}/${action}`
      );
      fetchUsers();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Users
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {/* Create User */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4 max-w-xl"
      >
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Temporary password"
          value={form.password}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create User
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">
                  {u.name}
                </td>
                <td className="p-2 border">
                  {u.email}
                </td>
                <td className="p-2 border">
                  {u.role}
                </td>
                <td className="p-2 border">
                  {u.is_active ? (
                    <span className="text-green-600">
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => toggleUser(u)}
                    className={`${
                      u.is_active
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}

            {!users.length && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
