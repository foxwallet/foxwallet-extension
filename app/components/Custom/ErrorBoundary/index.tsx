import { Component } from "react";
import { type INodeProps } from "../../../common/types";
import { type ErrorInfo } from "react-dom/client";
import { logger } from "@/common/utils/logger";

export type ErrorBoundaryProps = INodeProps & {
  onError?: (error: Error, info: ErrorInfo) => void;
  errorElement?: React.ReactElement;
};

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: { error: Error | undefined };
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Display fallback UI
    this.setState({
      error,
      errorInfo: info?.componentStack ?? "",
    });
    // You can also log the error to an error reporting service
    logger.error("ErrorBoundary: ", error, info);
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
