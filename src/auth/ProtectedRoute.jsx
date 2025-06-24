import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { loggedInUser, loading, refreshUser } = useAuth();

  const location = useLocation();
  useEffect(() => {
    refreshUser();
  }, []);

  console.log(loggedInUser);
  console.log(allowedRoles);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!loggedInUser) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(loggedInUser.roleName)) {
    console.log("users is not authorized", loggedInUser, allowedRoles);
    // Redirect to home or not-authorized page if user role doesn't match
    return <Navigate to="/not-authorized" replace />;
  }

  // Render child routes if authorized
  return <Outlet />;
};

export default ProtectedRoute;
