import React, { useContext } from "react";
import { KeepAliveClient, PopupServerClient } from "../common/utils/client";
import { PortName } from "../common/types/port";

interface Client {
  keepAliveClient: KeepAliveClient;
  popupServerClient: PopupServerClient;
}

export const clients = {
  keepAliveClient: new KeepAliveClient(PortName.POPUP_TO_BACKGROUND),
  popupServerClient: new PopupServerClient(),
};

export const ClientContext = React.createContext<Client>(clients);
