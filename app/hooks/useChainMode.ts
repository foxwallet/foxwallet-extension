import { useTranslation } from "react-i18next";
import { useGroupAccount } from "./useGroupAccount";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { isEqual } from "lodash";
import {
  chainModeSelector,
  currChainConfigsSelector,
  currChainUniqueIdsSelector,
} from "@/store/selectors/account";
import { useCallback, useMemo } from "react";
import { ChainAssembleMode } from "core/types/ChainUniqueId";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { matchAccountsWithUnqiueId } from "@/store/accountV2";
import { AleoConfig } from "core/coins/ALEO/types/AleoConfig";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";

export const useChainMode = () => {
  const { t } = useTranslation();

  const { groupAccount } = useGroupAccount();
  const chainMode = useSelector((state: RootState) => {
    return chainModeSelector(state);
  }, isEqual);

  const availableChainUniqueIds = useSelector((state: RootState) => {
    return currChainUniqueIdsSelector(state);
  }, isEqual);

  const availableChains = useSelector((state: RootState) => {
    return currChainConfigsSelector(state);
  }, isEqual);

  const chainModeName = useMemo(() => {
    return chainMode.mode === ChainAssembleMode.ALL
      ? t("Wallet:all_networks")
      : availableChains[0].chainName;
  }, [availableChains, chainMode.mode, t]);

  const availableAccounts: OneMatchAccount[] = useMemo(() => {
    const result =
      chainMode.mode === ChainAssembleMode.ALL
        ? groupAccount.group.accounts
        : matchAccountsWithUnqiueId(groupAccount, chainMode.uniqueId);

    return result.map((account) => {
      const { accounts, ...group } = groupAccount.group;
      return {
        wallet: groupAccount.wallet,
        group,
        account,
      };
    });
  }, [groupAccount, chainMode]);

  const getSelectedAccountWithChain = useCallback(
    async (configs?: ChainBaseConfig[]) => {
      const chains = configs ?? availableChains;
      try {
        if (availableAccounts.length === 0) {
          throw new Error(
            "Can't match account " +
              chainMode.mode +
              JSON.stringify(groupAccount.group.accounts),
          );
        }
        if (chains.length === 0) {
          throw new Error(
            "Can't match uniqueId " +
              chainMode.mode +
              (chainMode.mode === ChainAssembleMode.SINGLE &&
                chainMode.uniqueId),
          );
        }
        if (availableAccounts.length === 1 && chains.length === 1) {
          return {
            account: availableAccounts[0],
            chainConfig: chains[0],
          };
        }
        // TODO: add showSelectAccountDrawer
        // const account = await showSelectAccountDrawer({
        //   accounts: availableAccounts,
        //   chainConfigs: chains,
        //   onManageNetwork: navigation
        //     ? () => navigateToNetworksScreen(navigation)
        //     : undefined,
        // });
        // return account;
      } catch (err) {
        console.log("getSelectedAccountWithChain err: ", err);
        return undefined;
      }
    },
    [
      availableAccounts,
      availableChains,
      chainMode,
      groupAccount.group.accounts,
    ],
  );

  const res = useMemo(
    () => ({
      chainMode,
      chainModeName,
      availableChainUniqueIds,
      availableChains,
      availableAccounts,
      getSelectedAccountWithChain,
    }),
    [
      chainMode,
      chainModeName,
      availableChainUniqueIds,
      availableChains,
      availableAccounts,
      getSelectedAccountWithChain,
    ],
  );

  return res;
};
