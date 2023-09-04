import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ClientContext } from "./hooks/useClient";
import { KeepAliveClient } from "./common/utils/client";
import { PortName } from "./common/types/port";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <ClientContext.Provider
        value={{
          keepAliveClient: new KeepAliveClient(PortName.POPUP_TO_BACKGROUND),
        }}
      >
        <Provider store={store}>
          <App />
        </Provider>
      </ClientContext.Provider>
    </HashRouter>
  </React.StrictMode>
);
