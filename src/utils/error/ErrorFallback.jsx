import React from "react";

const ErrorFallback = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-semibold text-gray-800">
        Something went wrong!
      </h1>
      <p className="text-gray-500 mt-2">
        We couldn't load the page. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorFallback;
