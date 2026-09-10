import { useRoutes } from "react-router-dom";
import { routesConfig } from "./routes";
import ErrorBoundary from "./components/Custom/ErrorBoundary";
import { ViewPort } from "./components/Custom/ViewPort";
import { usePopupSelector } from "./hooks/useStore";
import { useEffect } from "react";
import { changeLanguage } from "./locales/i18";
import { ColorMode } from "./store/setting";
import { localStorageManager } from "@chakra-ui/react";

function App() {
  const routes = useRoutes(routesConfig);

  const language = usePopupSelector(state => state.setting.language);
  useEffect(() => {
    if (language) {
      void changeLanguage(language);
    }

    // for inintial color mode
    // const colorMode = store.getState().setting.colorMode;
    // if (colorMode === ColorMode.System) {
    //   localStorageManager.set("system");
    // }
  }, [language]);

  return (
    <ViewPort>
      <ErrorBoundary>{routes}</ErrorBoundary>
    </ViewPort>
  );
}

export default App;
