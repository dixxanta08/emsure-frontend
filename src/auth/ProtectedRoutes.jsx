import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

const ProtectedRoutes = () => {
  const { loggedInUser } = useAuth();
  console.log("ProtectedRoutes.jsx loggedInUser:", loggedInUser);

  const location = useLocation();

  if (!loggedInUser) {
    return <Navigate to="/login" state={{ from: location }} replace />; //redirect to login page and pass the current location
  }

  return <Outlet />;
};

export default ProtectedRoutes;
