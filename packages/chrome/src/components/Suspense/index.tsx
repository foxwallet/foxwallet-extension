import React from "react";
import { ReactNode, Suspense } from "react";
import { LoadingScreen } from "../Loading";

export const wrapSuspense = (children: ReactNode) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};
