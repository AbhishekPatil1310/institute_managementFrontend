import { useEffect, useState } from "react";
import api from "../../services/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/api/student/profile")
      .then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">
        Profile
      </h1>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Student Code:</strong>{" "}
          {profile.student_code}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
