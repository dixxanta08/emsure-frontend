import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
