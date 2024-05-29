import React from "react";
import { User } from "../Recoil";
import { useRecoilValue } from "recoil";
import { Navigate } from "react-router-dom";

const RouteGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const userIdCookie = useRecoilValue(User);

  console.log(typeof userIdCookie);
  console.log("On routeguard");

  if (typeof userIdCookie === "undefined") {
    console.log("hi");
    return <Navigate to="/signup" />;
  }

  return <>{children}</>;
};

export default RouteGuard;