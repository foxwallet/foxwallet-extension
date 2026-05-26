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
import { initAleoWasm } from "core/coins/ALEO/utils/wasmInit";

// Popup runs in a separate JS realm from the service worker, so the
// aleo_wasm_mainnet binding here starts uninitialized. ViewKey.from_string
// and friends fail with "Cannot read properties of undefined" until __wbg_init
// runs. Kick off init eagerly; initAleoWasm is idempotent and SWR will retry
// the first balance fetch if it races the wasm load.
void initAleoWasm().catch((error) => {
  console.error("[popup] initAleoWasm failed", error);
});

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
