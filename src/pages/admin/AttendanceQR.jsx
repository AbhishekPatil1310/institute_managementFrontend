import { useEffect, useState } from "react";
import api from "../../services/api";
import { QRCodeSVG } from "qrcode.react";

const AttendanceQR = () => {
    const [qr, setQr] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState(0);

    const fetchQR = async () => {
        setError(null);
        setLoading(true);

        try {
            const res = await api.post("/api/admin/attendance/qr");
            setQr(res.data);
        } catch {
            setError("Failed to generate QR");
        } finally {
            setLoading(false);
        }
    };

    /* ------------------ Countdown ------------------ */
    useEffect(() => {
        if (!qr) return;

        const update = () => {
            const diff =
                new Date(qr.expires_at).getTime() -
                Date.now();
            setRemaining(Math.max(0, Math.floor(diff / 1000)));
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [qr]);

    const isExpired = remaining <= 0;

    const qrUrl = qr
        ? `${window.location.origin}/student/attendance/scan?token=${qr.token}`
        : "";

    return (
        <div className="max-w-md">
            <h1 className="text-xl font-semibold mb-4">
                Attendance QR
            </h1>

            {error && (
                <p className="text-red-600 mb-3">{error}</p>
            )}

            <button
                onClick={fetchQR}
                disabled={loading}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
                {qr
                    ? isExpired
                        ? "Generate New QR"
                        : "Refresh QR"
                    : "Generate QR"}
            </button>

            {qr && (
                <div className="bg-white p-4 rounded shadow text-center">
                    <QRCodeSVG value={qrUrl} size={200} />

                    <p className="mt-3 text-sm text-gray-700">
                        Valid for:{" "}
                        <span className="font-semibold">
                            {isExpired ? "Expired" : `${remaining} sec`}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default AttendanceQR;
