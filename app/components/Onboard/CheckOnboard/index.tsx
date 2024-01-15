import { Navigate } from "react-router-dom";
import { useCurrAccount } from "@/hooks/useCurrAccount";

export const CheckOnboard = (props: { children: React.ReactNode }) => {
  const { selectedAccount } = useCurrAccount();
  const hasWallet = !!selectedAccount.address;

  if (hasWallet) {
    return props.children;
  }

  return <Navigate to={"/onboard"} replace />;
};
