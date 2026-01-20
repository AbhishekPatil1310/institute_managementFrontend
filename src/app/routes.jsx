import { lazy } from "react";

/* ---------- public ---------- */
const Login = lazy(() => import("../pages/public/Login"));
const StudentRegister = lazy(() =>
  import("../pages/public/StudentRegister")
);
const Unauthorized = lazy(() =>
  import("../pages/shared/Unauthorized")
);

/* ---------- layouts (NOT lazy) ---------- */
import StudentLayout from "../pages/student/StudentLayout";
import ReceptionistLayout from "../pages/receptionist/ReceptionistLayout";
import AdminLayout from "../pages/admin/AdminLayout";
import DTPLayout from "../pages/dtp/DTPLayout";


/* ---------- student ---------- */
const StudentDashboard = lazy(() =>
  import("../pages/student/Dashboard")
);

const StudentExams = lazy(() =>
  import("../pages/student/Exams")
);
const StudentProfile = lazy(() =>
  import("../pages/student/Profile")
);
const ChangePassword = lazy(() =>
  import("../pages/student/ChangePassword")
);

/* ---------- receptionist ---------- */
const ReceptionistDashboard = lazy(() =>
  import("../pages/receptionist/Dashboard")
);
const StudentSearch = lazy(() =>
  import("../pages/receptionist/StudentSearch")
);
const Admissions = lazy(() =>
  import("../pages/receptionist/Admissions")
);
const Payments = lazy(() =>
  import("../pages/receptionist/Payments")
);
const Dues = lazy(() =>
  import("../pages/receptionist/Dues")
);


/* ---------- dtp operator ---------- */
const DTPDashboard = lazy(() => import("../pages/dtp/Dashboard")); // Optional: Simple dashboard
const DTPMarksEntry = lazy(() => import("../pages/dtp/MarksEntry")); // The component we built


/* ---------- admin ---------- */
const AdminDashboard = lazy(() =>
  import("../pages/admin/Dashboard")
);
const Batches = lazy(() =>
  import("../pages/admin/Batches")
);
const Installments = lazy(() =>
  import("../pages/admin/Installments")
);
const References = lazy(() =>
  import("../pages/admin/References")
);
const Users = lazy(() =>
  import("../pages/admin/Users")
);
const Exams = lazy(() =>
  import("../pages/admin/Exams")
);
const AttendanceQR = lazy(() =>
  import("../pages/admin/AttendanceQR")
);
const FinancialReports = lazy(() =>
  import("../pages/admin/reports/Financial")
);
const AttendanceReports = lazy(() =>
  import("../pages/admin/reports/Attendance")
);

const Subjects = lazy(() => import("../pages/admin/Subjects"));


/*----------- Attendance Clerk------------*/

const ClerkLayout = lazy(() => import("../pages/clerk/ClerkLayout"));
const AttendanceScan = lazy(() => import("../pages/clerk/AttendanceScan"));
const AttendanceStatus = lazy(() => import("../pages/clerk/AttendanceStatus"));


/* ---------- route definitions ---------- */

export const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/student/register", element: <StudentRegister /> },
  { path: "/unauthorized", element: <Unauthorized /> },
];

export const studentRoutes = {
  path: "/student",
  layout: <StudentLayout />,
  children: [
    { path: "dashboard", element: <StudentDashboard /> },
    { path: "exams", element: <StudentExams /> },
    { path: "profile", element: <StudentProfile /> },
    {
      path: "profile/change-password",
      element: <ChangePassword />,
    },
  ],
};

export const dtpRoutes = {
  path: "/dtp",
  layout: <DTPLayout />,
  children: [
    { path: "dashboard", element: <DTPDashboard /> },
    { path: "marks-entry", element: <DTPMarksEntry /> },
  ],
};

export const clerkRoutes = {
  path: "/clerk",
  layout: <ClerkLayout />,
  children: [
    { path: "attendance-scan", element: <AttendanceScan /> },
    { path: "student-attendance", element: <AttendanceStatus /> },
  ],
};


export const receptionistRoutes = {
  path: "/receptionist",
  layout: <ReceptionistLayout />,
  children: [
    { path: "dashboard", element: <ReceptionistDashboard /> },
    { path: "students/search", element: <StudentSearch /> },
    { path: "admissions", element: <Admissions /> },
    { path: "payments", element: <Payments /> },
    { path: "dues", element: <Dues /> },
  ],
};

export const adminRoutes = {
  path: "/admin",
  layout: <AdminLayout />,
  children: [
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "batches", element: <Batches /> },
    { path: "installments", element: <Installments /> },
    { path: "references", element: <References /> },
    { path: "users", element: <Users /> },
    { path: "exams", element: <Exams /> },
    { path: "attendance-qr", element: <AttendanceQR /> },
    { path: "subjects", element: <Subjects /> },
    {
      path: "reports/financial",
      element: <FinancialReports />,
    },
    {
      path: "reports/attendance",
      element: <AttendanceReports />,
    },
  ],
};
