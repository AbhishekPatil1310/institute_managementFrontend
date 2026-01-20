import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // SVG is sharper and better for scanning
import api from "../../services/api";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/students/profile")
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Error loading data</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-center gap-6">
        <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
          {profile.name?.charAt(0)}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-gray-500">{profile.email}</p>
          <div className="mt-2 inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            ID: {profile.student_code}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-medium">{profile.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400">Joined On</p>
                <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE QR CODE SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-gray-700 mb-1">Digital ID</h3>
          <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-tighter">Show this for Attendance</p>
          
          <div className="p-3 bg-white border-4 border-indigo-50 rounded-xl shadow-inner">
            <QRCodeSVG 
              value={profile.student_code} // This matches the student_code your Clerk scans
              size={160}
              level={"H"} // High error correction
              includeMargin={true}
              imageSettings={{
                src: "/logo.png", // Optional: put your academy logo in the middle
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          
          <p className="mt-4 text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1 rounded">
            {profile.student_code}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;