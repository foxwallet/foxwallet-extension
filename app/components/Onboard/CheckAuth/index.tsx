import { Navigate } from "react-router-dom";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useSelector } from "react-redux";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useClient } from "@/hooks/useClient";
import { useCallback, useEffect, useState } from "react";
import Lock from "@/pages/Lock";
import { LoadingScreen } from "@/components/Custom/Loading";
import { useAuth } from "@/hooks/useAuth";

export const CheckAuth = (props: { children: React.ReactNode }) => {
  const { hasAuth, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hasAuth) {
    return <Lock />;
  }

  return <>{props.children}</>;
};
