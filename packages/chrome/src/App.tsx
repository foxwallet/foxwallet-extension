import React from "react";
import { useRoutes } from "react-router-dom";
import "./App.scss";
import { routesConfig } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const routes = useRoutes(routesConfig);

  return (
    <div className="app">
      <ErrorBoundary>{routes}</ErrorBoundary>
    </div>
  );
}

export default App;
