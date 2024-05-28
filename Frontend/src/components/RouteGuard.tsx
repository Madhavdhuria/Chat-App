import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../Recoil";
import { useRecoilValue } from "recoil";
const RouteGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const userIdCookie = useRecoilValue(User);
  useEffect(() => {
    if (!userIdCookie) {
      navigate("/home");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default RouteGuard;
