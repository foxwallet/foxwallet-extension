import { useRoutes } from "react-router-dom";
import { routesConfig } from "./routes";
import ErrorBoundary from "./components/Custom/ErrorBoundary";
import { ViewPort } from "./components/Custom/ViewPort";

function App() {
  const routes = useRoutes(routesConfig);
  return (
    <ViewPort>
      <ErrorBoundary>{routes}</ErrorBoundary>
    </ViewPort>
  );
}

export default App;
