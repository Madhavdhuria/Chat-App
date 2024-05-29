import React from "react";
import { User } from "../Recoil";
import { useRecoilValue } from "recoil";
import { Navigate } from "react-router-dom";

const RouteGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const userIdCookie = useRecoilValue(User);
  if (typeof userIdCookie === "undefined") {
    return <Navigate to="/signup" />;
  }

  return <>{children}</>;
};

export default RouteGuard;