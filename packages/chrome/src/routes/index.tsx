import React, { lazy } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { CheckOnboard } from "../components/Onboard/CheckOnboard";

const MainPage = lazy(async () => await import("../pages/Main"));
const OnboardHome = lazy(async () => await import("../pages/OnboardHome"));
const OnboardCreateWallet = lazy(
  async () => await import("../pages/OnboardCreateWallet")
);
const OnboardImportWallet = lazy(
  async () => await import("../pages/OnboardImportWallet")
);

// 加上 onboard 和 lock 逻辑
export const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: (
      <CheckOnboard>
        <Outlet />
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
];
