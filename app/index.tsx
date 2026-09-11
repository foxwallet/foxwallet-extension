import { Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./locales/i18";
import "./locales/time";
import "./index.scss";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store, storeReady } from "./store/store";
import { LoadingScreen } from "./components/Custom/Loading";
import { ChakraBaseProvider } from "@chakra-ui/react";
import { theme } from "./common/theme";
import { GlobalModal } from "./common/utils/dialog";
import { ViewPort } from "./components/Custom/ViewPort";
import { SWRConfig } from "swr";
import { swrCache } from "./common/utils/indexeddb";
import { initAleoWasm } from "core/coins/ALEO/utils/wasmInit";
import { isSidePanel } from "./common/utils/walletUI";

document.documentElement.dataset.walletUi = isSidePanel()
  ? "sidepanel"
  : window.location.pathname === "/notification.html"
  ? "notification"
  : "tab";

// Wallet UI runs in a separate JS realm from the service worker, so the
// aleo_wasm_mainnet binding here starts uninitialized. ViewKey.from_string
// and friends fail with "Cannot read properties of undefined" until __wbg_init
// runs. Kick off init eagerly; initAleoWasm is idempotent and SWR will retry
// the first balance fetch if it races the wasm load.
void initAleoWasm().catch((error) => {
  console.error("[wallet-ui] initAleoWasm failed", error);
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(<LoadingScreen />);

void storeReady
  .then(() => {
    root.render(
      <StrictMode>
        <HashRouter>
          <ChakraBaseProvider theme={theme}>
            <SWRConfig value={{ provider: swrCache }}>
              <Provider store={store}>
                <Suspense fallback={<LoadingScreen />}>
                  <App />
                </Suspense>
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
            <ViewPort fill={false}>
              <GlobalModal />
            </ViewPort>
          </Provider>
        </ChakraBaseProvider>
      </StrictMode>,
    );
  })
  .catch((error: Error) => {
    console.error("Wallet state could not be restored", error);
    root.render(
      <div role="alert">
        Unable to restore wallet state. Reload the extension to retry.
      </div>,
    );
  });
