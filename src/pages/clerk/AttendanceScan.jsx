import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../../services/api";

const AttendanceScan = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New: prevents multiple scans
  const [activeStudent, setActiveStudent] = useState(null); // New: stores student info

  useEffect(() => {
    api.get("/api/admin/batches")
      .then((res) => setBatches(res.data))
      .catch(() => setStatus({ type: "error", message: "Failed to load batches" }));
  }, []);

  useEffect(() => {
    let scanner = null;

    if (selectedBatch && isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        aspectRatio: 1.0
      });

      scanner.render(async (decodedText) => {
        // If we are already showing a student's detail, ignore new scans
        if (isProcessing) return;

        try {
          setIsProcessing(true); // Lock scanning
          
          const res = await api.post("/api/clerk/attendance/scan", {
            student_code: decodedText,
            batch_id: selectedBatch,
          });

          // Show Success Status and Student Details
          setStatus({ type: "success", message: res.data.message });
          setActiveStudent({
            name: res.data.studentName,
            code: decodedText
          });
          
          // Wait 2.5 seconds before resetting for the next student
          setTimeout(() => {
            setStatus({ type: "", message: "" });
            setActiveStudent(null);
            setIsProcessing(false); // Unlock scanning
          }, 2500);

        } catch (err) {
          setStatus({ 
            type: "error", 
            message: err.response?.data?.message || "Invalid Scan" 
          });
          
          // Keep the error visible for a moment then allow rescan
          setTimeout(() => {
            setStatus({ type: "", message: "" });
            setIsProcessing(false);
          }, 3000);
        }
      }, (err) => {
        // Ignore constant scanning noise
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [selectedBatch, isScanning, isProcessing]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Batch Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          1. Select Batch for Attendance
        </label>
        <select
          className="w-full p-3 border rounded-xl bg-gray-50 disabled:opacity-50"
          value={selectedBatch}
          disabled={isProcessing} // Disable selection while processing a scan
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            setIsScanning(false);
          }}
        >
          <option value="">-- Choose Batch --</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {selectedBatch && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border text-center">
          {!isScanning ? (
            <button
              onClick={() => setIsScanning(true)}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
            >
              📷 Open Camera to Scan
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  {isProcessing ? "Processing..." : "Camera Active"}
                </span>
                <button 
                  onClick={() => setIsScanning(false)}
                  className="text-xs text-red-500 font-bold"
                  disabled={isProcessing}
                >
                  Close Camera
                </button>
              </div>

              <div className="relative overflow-hidden rounded-xl border-4 border-gray-100 min-h-[300px] flex items-center justify-center bg-black">
                {/* The Scanner */}
                <div id="reader" className={`w-full ${isProcessing ? 'hidden' : 'block'}`}></div>
                
                {/* Student Info / Result Overlay */}
                {status.message && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-all ${
                    status.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}>
                    <div className="text-white text-center p-4">
                      <p className="text-6xl mb-4">{status.type === "success" ? "✅" : "❌"}</p>
                      
                      {activeStudent && (
                        <div className="mb-4 animate-bounce">
                          <p className="text-2xl font-black uppercase tracking-wide">{activeStudent.name}</p>
                          <p className="text-sm opacity-80">{activeStudent.code}</p>
                        </div>
                      )}
                      
                      <p className="font-bold text-lg bg-black/20 px-4 py-2 rounded-full inline-block">
                        {status.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-blue-800 font-bold text-xs uppercase mb-1">Instructions:</h4>
        <ul className="text-blue-700 text-xs space-y-1 list-disc pl-4">
          <li>System will pause for 2.5 seconds after each successful scan.</li>
          <li>Ensure the camera sees the QR code clearly.</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceScan;