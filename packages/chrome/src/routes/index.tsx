import React from "react";
import { lazy } from "react";
import { Navigate, Outlet, RouteObject } from "react-router-dom";
import { CheckOnboard } from "../components/CheckOnboard";

const MainPage = lazy(async () => await import("../pages/Main"));
const OnboardHome = lazy(async () => await import("../pages/OnboardHome"));

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
    ],
  },
];
