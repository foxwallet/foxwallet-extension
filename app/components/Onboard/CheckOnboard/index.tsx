import { Navigate } from "react-router-dom";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { type PropsWithChildren } from "react";

export const CheckOnboard = (props: PropsWithChildren): JSX.Element => {
  const { selectedAccount } = useCurrAccount();
  const hasOldAccount = !!selectedAccount.address;

  const { groupAccount } = useGroupAccount();
  const hasGroupAccount = groupAccount.group.accounts.length > 0;

  if (hasOldAccount || hasGroupAccount) {
    return <>{props.children}</>;
  }

  return <Navigate to={"/onboard"} replace />;
};
