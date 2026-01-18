import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSearchParams } from "react-router-dom";

const AttendanceScan = () => {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  /* -------- get location -------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setError("Location permission denied");
      }
    );
  }, []);

  const submit = async () => {
    if (!coords || !token) return;

    setStatus("submitting");
    setError(null);

    try {
      await api.post("/api/student/attendance/scan", {
        token,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setStatus("success");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Attendance failed"
      );
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">
        Attendance Scan
      </h1>

      {!token && (
        <p className="text-red-600">
          Invalid or missing QR token
        </p>
      )}

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      {status === "success" ? (
        <div className="bg-green-100 text-green-700 p-4 rounded">
          Attendance marked successfully ✅
        </div>
      ) : (
        <button
          onClick={submit}
          disabled={!coords || !token || status === "submitting"}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {status === "submitting"
            ? "Submitting..."
            : "Confirm Attendance"}
        </button>
      )}

      {!coords && !error && (
        <p className="text-sm text-gray-500 mt-3">
          Waiting for location permission…
        </p>
      )}
    </div>
  );
};

export default AttendanceScan;
