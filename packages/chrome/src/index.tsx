import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./locales/i18";
import "./locales/time";
import "./index.scss";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ClientContext, clients } from "./hooks/useClient";
import { LoadingScreen } from "./components/Loading";
import { ChakraBaseProvider } from "@chakra-ui/react";
import { theme } from "./common/theme";
import { GlobalModal } from "./common/utils/dialog";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <ChakraBaseProvider theme={theme}>
        <ClientContext.Provider value={clients}>
          <Provider store={store}>
            <Suspense fallback={<LoadingScreen />}>
              <App />
            </Suspense>
          </Provider>
        </ClientContext.Provider>
      </ChakraBaseProvider>
    </HashRouter>
  </React.StrictMode>
);

// pure modal, can't access other state in the modal, provide state by props
ReactDOM.createRoot(
  document.getElementById("modal-root") as HTMLElement
).render(
  <React.StrictMode>
    <ChakraBaseProvider theme={theme}>
      <GlobalModal />
    </ChakraBaseProvider>
  </React.StrictMode>
);
