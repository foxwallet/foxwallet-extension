import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStatus } from "../../hooks/useAppStatus";

export const CheckOnboard = (props: { children: React.ReactNode }) => {
  const { inited } = useAppStatus();

  if (inited) {
    return props.children;
  }

  return <Navigate to={"/onboard"} replace />;
};
