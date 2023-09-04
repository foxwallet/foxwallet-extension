import React from "react";
import { INodeProps } from "../../common/types";
import { ErrorInfo } from "react-dom/client";

export type ErrorBoundaryProps = INodeProps & {
  onError?: (error: Error, info: ErrorInfo) => void;
  errorElement?: React.ReactElement;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: { error: Error | undefined };
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Display fallback UI
    this.setState({
      error: error,
      errorInfo: info?.componentStack ?? "",
    });
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary: ", error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.errorElement) {
        return this.props.errorElement;
      }
      // Default error page
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
