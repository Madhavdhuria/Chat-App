import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RecoilRoot, useRecoilValue } from "recoil";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import App from "./App";
import RouteGuard from "./components/RouteGuard";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { User } from "./Recoil";
const ProtectedRoute = () => <RouteGuard>{<Outlet />}</RouteGuard>;

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userIdCookie = useRecoilValue(User);
  return userIdCookie ? <Navigate to="/" /> : <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App/>
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/signin",
    element: (
      <PublicRoute>
        <Signin />
      </PublicRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
);
