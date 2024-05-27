import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RecoilRoot } from "recoil";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/Signup";
import App from "./App";
import RouteGuard from "./components/RouteGuard";
import { Outlet } from "react-router-dom";
const ProtectedRoute = () => (
  <RouteGuard>
    <Outlet />
  </RouteGuard>
);
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />, // Apply RouteGuard to this route
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
);
