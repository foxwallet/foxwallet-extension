import React from "react";
import { lazy } from "react";
import { Navigate, Outlet, RouteObject } from "react-router-dom";
import { wrapSuspense } from "../components/Suspense";

const MainPage = lazy(async () => await import("../pages/Main"));

export const routesConfig: RouteObject[] = [
  {
    path: "/",
    children: [
      {
        index: true,
        element: <Navigate to="home" />,
      },
      {
        path: "home",
        element: wrapSuspense(<MainPage />),
      },
    ],
  },
];
