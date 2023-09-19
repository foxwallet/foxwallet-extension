import React, { useContext } from "react";
import {
  AuthManager,
  authManager,
} from "../store/vault/managers/auth/AuthManager";
import {
  KeyringManager,
  keyringManager,
} from "../store/vault/managers/keyring/KeyringManager";

interface Manager {
  authManager: AuthManager;
  keyringManager: KeyringManager;
}

export const managers = {
  authManager: authManager,
  keyringManager: keyringManager,
};

export const ManagerContext = React.createContext<Manager>(managers);

export const useManagers = () => {
  const managers = useContext(ManagerContext);
  return managers;
};
