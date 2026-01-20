import { createBrowserRouter } from "react-router-dom";
import App from "./App"; // Import the App component
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

import {
  publicRoutes,
  studentRoutes,
  receptionistRoutes,
  adminRoutes,
  dtpRoutes,
  clerkRoutes
} from "./routes";

export const router = createBrowserRouter([
  {
    element: <App />, // App component as the root element
    children: [
      ...publicRoutes,
      {
        element: <RequireAuth />,
        children: [
          {
            path: studentRoutes.path,
            element: (
              <RequireRole role="STUDENT">{studentRoutes.layout}</RequireRole>
            ),
            children: studentRoutes.children,
          },
          {
            path: receptionistRoutes.path,
            element: (
              <RequireRole role="RECEPTIONIST">
                {receptionistRoutes.layout}
              </RequireRole>
            ),
            children: receptionistRoutes.children,
          },
          {
            path: adminRoutes.path,
            element: (
              <RequireRole role="ADMIN">{adminRoutes.layout}</RequireRole>
            ),
            children: adminRoutes.children,
          },
          {
            path: dtpRoutes.path,
            element: (
              <RequireRole role="DTP Operator">{dtpRoutes.layout}</RequireRole>
            ),
            children: dtpRoutes.children,
          },
          {
            path: clerkRoutes.path,
            element: (
              <RequireRole role="Attendance Clerk">{clerkRoutes.layout}</RequireRole>
            ),
            children: clerkRoutes.children,
          },
        ],
      },
    ],
  },
]);
