import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorFallback from "./ErrorFallback";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false }; // this is the initial state
  }

  static getDerivedStateFromError(error) {
    //Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught in error boundary", error, errorInfo);
  }
  handleRetry = () => {
    // reset thje state and optionally reload the page
    this.setState({ hasError: false });
  };
  render() {
    console.log("this.state.hasError: ", this.state.hasError);
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const ErrorBoundaryWithRetry = ({ children }) => {
  const navigate = useNavigate();

  return <ErrorBoundary navigate={navigate}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWithRetry;
