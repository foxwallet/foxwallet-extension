import React, { useContext } from "react";
import { KeepAliveClient } from "../common/utils/client";

type Client = {
  keepAliveClient: KeepAliveClient;
};

export const ClientContext = React.createContext<Client | null>(null);
