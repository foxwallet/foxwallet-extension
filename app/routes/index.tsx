import React, { lazy } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { CheckOnboard } from "@/components/Onboard/CheckOnboard";
import { CheckAuth } from "@/components/Onboard/CheckAuth";
import { CheckBrowserVersion } from "@/components/Onboard/CheckBrowserVersion";
import NetworkDetailScreen from "@/pages/Me/NetworkDetail";

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
const Join = lazy(async () => await import("../pages/Wallet/Join"));
const Split = lazy(async () => await import("../pages/Wallet/Split"));
const AddToken = lazy(async () => await import("../pages/Wallet/AddToken"));
const SelectToken = lazy(
  async () => await import("../pages/Wallet/SelectToken"),
);
const SelectTokenV2 = lazy(
  async () => await import("../pages/Wallet/SelectTokenV2"),
);

// SettingTab
const ManageWallet = lazy(async () => await import("../pages/Me/ManageWallet"));
const CreateWallet = lazy(async () => await import("../pages/Me/CreateWallet"));
const CreateMnemonic = lazy(
  async () => await import("../pages/Me/CreateMnemonic"),
);
const BackupMnemonic = lazy(
  async () => await import("../pages/Me/BackupMnemonic"),
);
const ImportMnemonic = lazy(
  async () => await import("../pages/Me/ImportMnemonic"),
);
const ImportPrivateKey = lazy(
  async () => await import("../pages/Me/ImportPrivateKey"),
);
const Language = lazy(async () => await import("../pages/Me/Language"));
const ExportSeedPhrase = lazy(
  async () => await import("../pages/Me/ExportSeedPhrase"),
);
const ExportPrivateKey = lazy(
  async () => await import("../pages/Me/ExportPrivateKey"),
);
const Community = lazy(async () => await import("../pages/Me/Community"));
const Settings = lazy(async () => await import("../pages/Me/Settings"));
const Currency = lazy(async () => await import("../pages/Me/Currency"));
const About = lazy(async () => await import("../pages/Me/About"));
const ChangePassword = lazy(
  async () => await import("../pages/Me/ChangePassword"),
);
const WalletDetail = lazy(async () => await import("../pages/Me/WalletDetail"));
const Contacts = lazy(async () => await import("../pages/Me/Contacts"));
const ConnectedSites = lazy(
  async () => await import("../pages/Me/ConnectedSites"),
);
const Networks = lazy(async () => await import("../pages/Me/Networks"));
const AddOrEditContact = lazy(
  async () => await import("../pages/Me/AddOrEditContact"),
);
const SendToken = lazy(async () => await import("../pages/Wallet/Send"));
const NetworkDetail = lazy(
  async () => await import("../pages/Me/NetworkDetail"),
);
const SelectNetwork = lazy(
  async () => await import("../pages/Wallet/SelectNetwork"),
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
      <CheckBrowserVersion>
        <CheckOnboard>
          <CheckAuth>
            <Outlet />
          </CheckAuth>
        </CheckOnboard>
      </CheckBrowserVersion>
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
        path: "join",
        element: <Join />,
      },
      {
        path: "split",
        element: <Split />,
      },
      {
        path: "receive/:uniqueId/:address",
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
        path: "token_detail/:uniqueId/:address",
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
        path: "add_token",
        element: <AddToken />,
      },
      {
        path: "select_token/:uniqueId/:address",
        element: <SelectToken />,
      },
      {
        path: "contacts",
        element: <Contacts />,
      },
      {
        path: "connected_sites",
        element: <ConnectedSites />,
      },
      {
        path: "networks",
        element: <Networks />,
      },
      {
        path: "add_or_edit_contact/:addOrEdit",
        element: <AddOrEditContact />,
      },
      {
        path: "send_token",
        element: <SendToken />,
      },
      {
        path: "network_detail/:uniqueId",
        element: <NetworkDetail />,
      },
      {
        path: "select_network/:action",
        element: <SelectNetwork />,
      },
      {
        path: "select_token_v2/:uniqueId/:action",
        element: <SelectTokenV2 />,
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
