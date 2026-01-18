import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

import {
  publicRoutes,
  studentRoutes,
  receptionistRoutes,
  adminRoutes,
} from "./routes";

export const router = createBrowserRouter([
  ...publicRoutes,

  {
    element: <RequireAuth />,
    children: [
      {
        path: studentRoutes.path,
        element: (
          <RequireRole role="STUDENT">
            {studentRoutes.layout}
          </RequireRole>
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
          <RequireRole role="ADMIN">
            {adminRoutes.layout}
          </RequireRole>
        ),
        children: adminRoutes.children,
      },
    ],
  },
]);
