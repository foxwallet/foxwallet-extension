import React, { lazy } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { CheckOnboard } from "../components/Onboard/CheckOnboard";
import { CheckAuth } from "@/components/Onboard/CheckAuth";

// WalletTab
const MainPage = lazy(async () => await import("../pages/Main"));
const SendAleo = lazy(async () => await import("../pages/SendAleo"));
const Receive = lazy(async () => await import("../pages/Receive"));
const ConnectDapp = lazy(async () => await import("../pages/ConnectDapp"));
const RequestTx = lazy(async () => await import("../pages/RequestTx"));
const SignMessage = lazy(async () => await import("../pages/SignMessage"));
const Deployment = lazy(async () => await import("../pages/Deployment"));
const TokenDetail = lazy(async () => await import("../pages/TokenDetail"));
const WalletDetail = lazy(async () => await import("../pages/WalletDetail"));

// SettingTab
const ManageWallet = lazy(async () => await import("../pages/ManageWallet"));
const CreateWallet = lazy(async () => await import("../pages/CreateWallet"));
const CreateMnemonic = lazy(
  async () => await import("../pages/CreateMnemonic"),
);
const BackupMnemonic = lazy(
  async () => await import("../pages/BackupMnemonic"),
);
const ImportMnemonic = lazy(
  async () => await import("../pages/ImportMnemonic"),
);
const ImportPrivateKey = lazy(
  async () => await import("../pages/ImportPrivateKey"),
);
const Language = lazy(async () => await import("../pages/Language"));

const OnboardHome = lazy(async () => await import("../pages/OnboardHome"));
const OnboardCreateWallet = lazy(
  async () => await import("../pages/OnboardCreateWallet"),
);
const OnboardImportWallet = lazy(
  async () => await import("../pages/OnboardImportWallet"),
);

// 加上 onboard 和 lock 逻辑
export const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: (
      <CheckOnboard>
        <CheckAuth>
          <Outlet />
        </CheckAuth>
      </CheckOnboard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="main" />,
      },
      {
        path: "main",
        element: <MainPage />,
      },
      {
        path: "send_aleo",
        element: <SendAleo />,
      },
      {
        path: "receive",
        element: <Receive />,
      },
      {
        path: "connect/:requestId",
        element: <ConnectDapp />,
      },
      {
        path: "request_tx/:requestId",
        element: <RequestTx />,
      },
      {
        path: "sign_message/:requestId",
        element: <SignMessage />,
      },
      {
        path: "request_deploy/:requestId",
        element: <Deployment />,
      },
      {
        path: "manage_wallet",
        element: <ManageWallet />,
      },
      {
        path: "create_wallet",
        element: <CreateWallet />,
      },
      {
        path: "create_mnemonic",
        element: <CreateMnemonic />,
      },
      {
        path: "backup_mnemonic",
        element: <BackupMnemonic />,
      },
      {
        path: "import_mnemonic",
        element: <ImportMnemonic />,
      },
      {
        path: "import_private_key",
        element: <ImportPrivateKey />,
      },
      {
        path: "manage_language",
        element: <Language />,
      },
      {
        path: "token_detail",
        element: <TokenDetail />,
      },
      {
        path: "wallet_detail/:walletId",
        element: <WalletDetail />,
      },
    ],
  },
  {
    path: "onboard",
    children: [
      {
        index: true,
        element: <Navigate to="/onboard/home" />,
      },
      {
        path: "home",
        element: <OnboardHome />,
      },
      {
        path: "create",
        element: <OnboardCreateWallet />,
      },
      {
        path: "import",
        element: <OnboardImportWallet />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/home" />,
  },
];
