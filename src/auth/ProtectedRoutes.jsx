// import React, { useContext, useEffect } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { AuthProvider, useAuth } from "./AuthContext";

// const ProtectedRoutes = ({ allowedRoles }) => {
//   const { loggedInUser, loading, refreshUser } = useAuth();

//   const location = useLocation();
//   useEffect(() => {
//     refreshUser();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   if (!loggedInUser) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }
//   if (!allowedRoles.includes(loggedInUser.roleName)) {
//     return <Navigate to="/not-authorized" />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoutes;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

const ProtectedRoutes = () => {
  const { loggedInUser, loading, refreshUser } = useAuth();

  const location = useLocation();
  useEffect(() => {
    refreshUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!loggedInUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log(loggedInUser);
  switch (loggedInUser.roleName) {
    case "EMPLOYEE":
      return <Navigate to="/employee-dashboard" />;
    case "EMPLOYER":
      return <Navigate to="/company-dashboard" />;
    case "AGENT":
    case "SUPER_ADMIN":
    case "INSURANCE_WORKER":
      return <Navigate to="/people-organizations/agents" />;
    default:
      return <Navigate to="/login" />;
  }
};
export default ProtectedRoutes;
