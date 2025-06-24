import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({ type = "404" }) => {
  const navigate = useNavigate();

  const errorInfo = {
    "404": {
      title: "404",
      message: "Page Not Found",
      description: "Oops! The page you're looking for doesn't exist.",
      color: "red",
    },
    "401": {
      title: "401",
      message: "Unauthorized Access",
      description: "You don't have permission to view this page.",
      color: "yellow",
    },
  };

  const { title, message, description, color } = errorInfo[type] || errorInfo["404"];

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className={`text-7xl font-extrabold text-${color}-500`}>{title}</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-800">{message}</p>
        <p className="mt-2 text-gray-500">{description}</p>
        <button
          onClick={() => navigate("/")}
          className={`mt-6 px-6 py-3 bg-${color}-500 text-white font-semibold rounded-lg shadow-md hover:bg-${color}-600 transition`}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
