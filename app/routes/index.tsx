import React, { lazy } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { CheckOnboard } from "../components/Onboard/CheckOnboard";
import { CheckAuth } from "@/components/Onboard/CheckAuth";

// WalletTab
const MainPage = lazy(async () => await import("../pages/Main"));
const SendAleo = lazy(async () => await import("../pages/Wallet/SendAleo"));
const Receive = lazy(async () => await import("../pages/Wallet/Receive"));
const ConnectDapp = lazy(async () => await import("../pages/Dapp/ConnectDapp"));
const RequestTx = lazy(async () => await import("../pages/Dapp/RequestTx"));
const SignMessage = lazy(async () => await import("../pages/Dapp/SignMessage"));
const Deployment = lazy(async () => await import("../pages/Dapp/Deployment"));
const TokenDetail = lazy(
  async () => await import("../pages/Wallet/TokenDetail"),
);
const TransactionDetail = lazy(
  async () => await import("../pages/Wallet/TransactionDetail"),
);

// SettingTab
const ManageWallet = lazy(
  async () => await import("../pages/Setting/ManageWallet"),
);
const CreateWallet = lazy(
  async () => await import("../pages/Setting/CreateWallet"),
);
const CreateMnemonic = lazy(
  async () => await import("../pages/Setting/CreateMnemonic"),
);
const BackupMnemonic = lazy(
  async () => await import("../pages/Setting/BackupMnemonic"),
);
const ImportMnemonic = lazy(
  async () => await import("../pages/Setting/ImportMnemonic"),
);
const ImportPrivateKey = lazy(
  async () => await import("../pages/Setting/ImportPrivateKey"),
);
const Language = lazy(async () => await import("../pages/Setting/Language"));
const ExportSeedPhrase = lazy(
  async () => await import("../pages/Setting/ExportSeedPhrase"),
);
const ExportPrivateKey = lazy(
  async () => await import("../pages/Setting/ExportPrivateKey"),
);
const Community = lazy(async () => await import("../pages/Setting/Community"));
const Settings = lazy(async () => await import("../pages/Setting/Settings"));
const Currency = lazy(async () => await import("../pages/Setting/Currency"));
const About = lazy(async () => await import("../pages/Setting/About"));
const ChangePassword = lazy(
  async () => await import("../pages/Setting/ChangePassword"),
);
const WalletList = lazy(
  async () => await import("../pages/Setting/WalletList"),
);
const WalletDetail = lazy(
  async () => await import("../pages/Setting/WalletDetail"),
);

// Onboard
const OnboardHome = lazy(
  async () => await import("../pages/Onboard/OnboardHome"),
);
const OnboardCreateWallet = lazy(
  async () => await import("../pages/Onboard/OnboardCreateWallet"),
);
const OnboardImportWallet = lazy(
  async () => await import("../pages/Onboard/OnboardImportWallet"),
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
        path: "backup_mnemonic/:walletId",
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
        path: "token_detail/:uniqueId",
        element: <TokenDetail />,
      },
      {
        path: "wallet_detail/:walletId",
        element: <WalletDetail />,
      },
      {
        path: "export_seed_phrase/:walletId",
        element: <ExportSeedPhrase />,
      },
      {
        path: "export_private_key/:walletId/:accountId/:coinType",
        element: <ExportPrivateKey />,
      },
      {
        path: "transaction_detail/:txId",
        element: <TransactionDetail />,
      },
      {
        path: "community",
        element: <Community />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "manage_currency",
        element: <Currency />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "change_password",
        element: <ChangePassword />,
      },
      {
        path: "wallet_list",
        element: <WalletList />,
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
