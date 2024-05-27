import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RouteGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const cookies = document.cookie.split(";").map(cookie => cookie.trim());
    const userIdCookie = cookies.find(cookie => cookie.startsWith("userId="));
    if (!userIdCookie) {
      navigate("/signup");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default RouteGuard;
