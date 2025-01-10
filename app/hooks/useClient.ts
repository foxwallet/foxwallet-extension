import React, { useContext } from "react";
import { KeepAliveClient, PopupServerClient } from "@/common/utils/client";
import { PortName } from "@/common/types/port";

interface Client {
  keepAliveClient: KeepAliveClient;
  popupServerClient: PopupServerClient;
}

let clients: Client | null = null;

export const getClients = () => {
  if (clients) return clients;
  clients = {
    keepAliveClient: new KeepAliveClient(PortName.POPUP_TO_BACKGROUND),
    popupServerClient: new PopupServerClient(),
  };
  return clients;
};

export const useClient = () => {
  const clients = getClients();
  return clients;
};
