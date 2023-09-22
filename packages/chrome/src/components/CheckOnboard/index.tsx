
import { Navigate } from "react-router-dom";
import { useAppStatus } from "../../hooks/useAppStatus";

export const CheckOnboard = (props: { children: React.ReactNode }) => {
  const { hasWallet } = useAppStatus();

  if (hasWallet) {
    return props.children;
  }

  return <Navigate to={"/onboard"} replace />;
};
