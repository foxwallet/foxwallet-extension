import { Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./locales/i18";
import "./locales/time";
import "./index.scss";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { LoadingScreen } from "./components/Custom/Loading";
import { ChakraBaseProvider } from "@chakra-ui/react";
import { theme } from "./common/theme";
import { PersistGate } from "redux-persist/integration/react";
import { getPersistor } from "@rematch/persist";
import { GlobalModal } from "./common/utils/dialog";
import { ViewPort } from "./components/Custom/ViewPort";
import { SWRConfig } from "swr";
import { swrCache } from "./common/utils/indexeddb";

const persistor = getPersistor();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <ChakraBaseProvider theme={theme}>
        <SWRConfig value={{ provider: swrCache }}>
          <Provider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              <Suspense fallback={<LoadingScreen />}>
                <App />
              </Suspense>
            </PersistGate>
          </Provider>
        </SWRConfig>
      </ChakraBaseProvider>
    </HashRouter>
  </StrictMode>,
);

// pure modal, can't access other state in the modal, provide state by props
ReactDOM.createRoot(
  document.getElementById("modal-root") as HTMLElement,
).render(
  <StrictMode>
    <ChakraBaseProvider theme={theme}>
      <Provider store={store}>
        <ViewPort>
          <GlobalModal />
        </ViewPort>
      </Provider>
    </ChakraBaseProvider>
  </StrictMode>,
);
