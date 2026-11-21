import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./routes/Home";
import { Browse } from "./routes/Browse";
import { ItemDetail } from "./routes/ItemDetail";
import { Report } from "./routes/Report";
import { MyReports } from "./routes/MyReports";
import { Admin } from "./routes/Admin";
import { SignIn } from "./routes/SignIn";
import { NotFound } from "./routes/NotFound";
import { StyleguideRoute } from "./routes/Styleguide";
import { MotionProvider } from "./motion/MotionProvider";
import { ToastProvider } from "./motion/Toast";

// Data router hierarchy with AppLayout shell
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "browse",
        element: <Browse />,
      },
      {
        path: "items/:id",
        element: <ItemDetail />,
      },
      {
        path: "report",
        element: <Report />,
      },
      {
        path: "my-reports",
        element: <MyReports />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "styleguide",
        element: <StyleguideRoute />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export const App: React.FC = () => {
  return (
    <MotionProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </MotionProvider>
  );
};

export default App;
