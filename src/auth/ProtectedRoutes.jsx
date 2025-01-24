import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

const ProtectedRoutes = () => {
  const { loggedInUser, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  } else {
    if (!loggedInUser) {
      return <Navigate to="/login" state={{ from: location }} replace />; //redirect to login page and pass the current location
    }

    return <Outlet />;
  }
};

export default ProtectedRoutes;
