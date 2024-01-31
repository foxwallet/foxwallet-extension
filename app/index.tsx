import { Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./locales/i18";
import "./locales/time";
import "./index.scss";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ClientContext, clients } from "./hooks/useClient";
import { LoadingScreen } from "./components/Custom/Loading";
import { ChakraBaseProvider } from "@chakra-ui/react";
import { theme } from "./common/theme";
import { PersistGate } from "redux-persist/integration/react";
import { getPersistor } from "@rematch/persist";

const persistor = getPersistor();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <ChakraBaseProvider theme={theme}>
        <ClientContext.Provider value={clients}>
          <Provider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              <Suspense fallback={<LoadingScreen />}>
                <App />
              </Suspense>
            </PersistGate>
          </Provider>
        </ClientContext.Provider>
      </ChakraBaseProvider>
    </HashRouter>
  </StrictMode>,
);
