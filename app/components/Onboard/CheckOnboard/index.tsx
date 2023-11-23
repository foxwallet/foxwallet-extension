import { Navigate } from "react-router-dom";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { store } from "@/store/store";

export const CheckOnboard = (props: { children: React.ReactNode }) => {
  const { selectedAccount } = useCurrAccount();
  const hasWallet = !!selectedAccount.address;

  if (hasWallet) {
    return props.children;
  }

  return <Navigate to={"/onboard"} replace />;
};
