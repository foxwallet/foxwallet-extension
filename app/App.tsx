import { useRoutes } from "react-router-dom";
import { routesConfig } from "./routes";
import ErrorBoundary from "./components/Custom/ErrorBoundary";
import { ViewPort } from "./components/Custom/ViewPort";
import { store } from "./store/store";
import { useEffect } from "react";
import { changeLanguage } from "./locales/i18";

function App() {
  const routes = useRoutes(routesConfig);

  useEffect(() => {
    const language = store.getState().setting.language;
    if (language) {
      changeLanguage(language);
    }
  }, []);

  return (
    <ViewPort>
      <ErrorBoundary>{routes}</ErrorBoundary>
    </ViewPort>
  );
}

export default App;
