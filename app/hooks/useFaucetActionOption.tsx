import {
  ChainAssembleMode,
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { useFaucetStatus } from "@/hooks/useFaucetStatus";
import React, { useCallback, useMemo, useState } from "react";
import { FaucetStatus } from "core/coins/ALEO/types/Faucet";
import Browser from "webextension-polyfill";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import type { AleoService } from "core/coins/ALEO/service/AleoService";
import { showSignMessageDialog } from "@/components/Wallet/SignMessageDrawer";
import { stringToHex } from "@/common/utils/hex";
import { showFaucetClaimedDialog } from "@/components/Wallet/FaucetClaimedDialog";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { useCoinService } from "@/hooks/useCoinService";
import { useClient } from "@/hooks/useClient";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useTranslation } from "react-i18next";
import { IconFaucet } from "@/components/Custom/Icon";
import { type ActionButtonProps } from "@/components/Wallet/AccountInfoHeader";

export const useFaucetActionOption = (uniqueId: ChainUniqueId) => {
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { t } = useTranslation();

  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const { chainConfig, coinService } = useCoinService(uniqueId);
  const { popupServerClient } = useClient();
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const { faucetStatus, getFaucetStatus } = useFaucetStatus(
    uniqueId,
    selectedAccount,
  );

  const onPressFaucet = useCallback(async () => {
    if (requestingFaucet) return;
    setRequestingFaucet(true);
    try {
      if (chainConfig.innerFaucet) {
        const status = await getFaucetStatus();
        switch (status?.status) {
          case FaucetStatus.UNREADY: {
            if (chainConfig.faucetApi) {
              void Browser.tabs.create({ url: chainConfig.faucetApi });
            }
            break;
          }
          case FaucetStatus.EMPTY: {
            const address = selectedAccount.account.address;
            const coinType = chainUniqueIdToCoinType(uniqueId);
            const { rawMessage, displayMessage } = await (
              coinService as AleoService
            ).faucetMessage(address);
            const { confirmed } = await showSignMessageDialog({
              address,
              message: displayMessage,
            });
            if (confirmed) {
              const signature = await popupServerClient.signMessage({
                walletId: selectedAccount.wallet.walletId,
                accountId: selectedAccount.account.accountId,
                coinType,
                message: stringToHex(rawMessage),
              });
              const res = await (coinService as AleoService).requestFaucet({
                address,
                message: rawMessage,
                signature,
              });
              if (!res) {
                throw new Error("Request faucet failed");
              }
              await getFaucetStatus();
            }
            break;
          }
          case FaucetStatus.PENDING: {
            break;
          }
          case FaucetStatus.DONE: {
            const { confirmed } = await showFaucetClaimedDialog({
              content: status.txId ? t("Faucet:claimed") : t("Faucet:wait"),
              onChain: !!status.txId,
            });
            if (confirmed && status.txId) {
              const lang =
                getCurrLanguage() === SupportLanguages.ZH
                  ? ExplorerLanguages.ZH
                  : ExplorerLanguages.EN;
              const url = (coinService as AleoService).getTxDetailUrl(
                status.txId,
                lang,
              );
              if (url) {
                void Browser.tabs.create({ url });
              }
            }
            break;
          }
        }
      } else if (chainConfig.faucetApi) {
        void Browser.tabs.create({ url: chainConfig.faucetApi });
      }
    } catch (err) {
      void showErrorToast({ message: (err as Error).message });
    } finally {
      setRequestingFaucet(false);
    }
  }, [
    requestingFaucet,
    chainConfig,
    getFaucetStatus,
    selectedAccount,
    uniqueId,
    coinService,
    popupServerClient,
    t,
  ]);

  const option: ActionButtonProps = useMemo(() => {
    return {
      title: t("Faucet:title"),
      icon: <IconFaucet w={9} h={9} />,
      onPress: onPressFaucet,
      isLoading:
        requestingFaucet || faucetStatus?.status === FaucetStatus.PENDING,
    };
  }, [faucetStatus, onPressFaucet, requestingFaucet, t]);

  return option;
};
