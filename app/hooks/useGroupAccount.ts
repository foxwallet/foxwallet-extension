import { type ChainUniqueId } from "core/types/ChainUniqueId";
import { usePopupDispatch, usePopupSelector } from "./useStore";
import { useCallback, useEffect, useMemo } from "react";
import {
  allChainConfigsSelector,
  selectedGroupAccountSelector,
} from "@/store/selectors/account";
import { matchAccountsWithUnqiueId } from "@/store/accountV2";
import { type OneMatchAccount } from "@/scripts/background/store/vault/types/keyring";
import { isEqual } from "lodash";
import { useSelector } from "react-redux";
import { type RootState, store } from "@/store/store";
import { getChainConfig } from "@/services/coin/CoinService";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { getInnerChainConfigByFilter } from "core/helper/ChainConfig";

export const useGroupAccount = () => {
  const groupAccount = usePopupSelector(
    (state) => selectedGroupAccountSelector(state),
    isEqual,
  );

  const dispatch = usePopupDispatch();

  useEffect(() => {
    void dispatch.accountV2.getSelectedGroupAccount();
  }, [dispatch.accountV2]);

  const getMatchAccountsWithUniqueId = useCallback(
    (uniqueId: ChainUniqueId) => {
      const accounts = matchAccountsWithUnqiueId(groupAccount, uniqueId);
      const { accounts: _, ...restGroup } = groupAccount.group;
      return accounts.map((account) => {
        const accountInfo: OneMatchAccount = {
          wallet: groupAccount.wallet,
          group: restGroup,
          account,
        };
        return accountInfo;
      });
    },
    [groupAccount],
  );

  return {
    groupAccount,
    getMatchAccountsWithUniqueId,
  };
};

export const useChainConfig = (uniqueId: ChainUniqueId) => {
  const chainConfig = useSelector(
    (state: RootState) => getChainConfig({ state, uniqueId })!,
    (prev, next) => isEqual(prev, next),
  );
  const coinService = coinServiceEntry.getInstance(uniqueId);

  const supportFlags = useMemo(() => {
    return {
      // supportRegisterAccount: coinService.supportRegisterAccount(),
      // supportRegisterAccountData: coinService.supportRegisterAccountData(),
      // supportAccountRent: coinService.supportAccountRent(),
      // supportEstimateGasFee: coinService.supportEstimateGasFee(),
      supportCustomGasFee: coinService.supportCustomGasFee(),
      // supportFaucetAirDrop: coinService.supportFaucetAirDrop(),
      supportFeeData: coinService.supportFeeData(),
      // supportNFT: coinService.supportNFT(),
      // supportBRC20: coinService.supportBRC20(),
      // supportDefi: coinService.supportDefi(),
      // supportNameService: coinService.supportNameService(),
      supportSendMaxNative: coinService.supportSendMaxNative(),
      supportNativeCoinTxDetail: coinService.supportNativeCoinTxDetail(),
      supportNativeCoinTxHistory: coinService.supportNativeCoinTxHistory(),
      supportNonce: coinService.supportNonce(),
      // supportResyncNFT: coinService.supportResyncNFT(),
      supportToken: coinService.supportToken(),
      // supportTokenAccount: coinService.supportTokenAccount(),
      // supportTokenAccountAutoCreate:
      //   coinService.supportTokenAccountAutoCreate(),
      // supportTokenApprove: coinService.supportTokenApprove(),
      // supportTokenList: coinService.supportTokenList(),
      // supportTokenRegister: coinService.supportTokenRegister(),
      supportTokenTxDetail: coinService.supportTokenTxDetail(),
      supportTokenTxHistory: coinService.supportTokenTxHistory(),
      supportUserInteractiveToken: coinService.supportUserInteractiveToken(),
      // supportAddressTransform: coinService.supportAddressTransform(),
      supportGasGrade: coinService.supportGasGrade(),
      // supportEstimateWithoutTarget: coinService.supportEstimateWithoutTarget(),
      // supportAddressRescan: coinService.supportAddressRescan(),
      // supportMemo: coinService.supportMemo(),
      // supportUTXOConsolidation: coinService.supportUTXOConsolidation(),
      // supportUTXOLimit: coinService.supportUTXOLimit(),
      // supportMultiHDAccount: coinBasicEntry.getSupportMultiHDAccount(
      //   chainConfig.coinType,
      // ),
      // supportAccountActivate: coinService.supportAccountActivate(),
      // supportPaymentSwitch: coinService.supportPaymentSwitch(),
    };
  }, [coinService]);

  return {
    chainConfig,
    coinService,
    ...supportFlags,
  };
};

export const getChainConfigsByFilter = ({
  state,
  filter,
}: {
  state?: RootState;
  filter: (config: ChainBaseConfig) => boolean;
}) => {
  let currState = state;
  if (!currState) {
    currState = store.getState();
  }
  const configs = currState.multiChain.chainConfigItems?.filter(filter);
  const innerConfigs = getInnerChainConfigByFilter({ filter });
  const finalConfigs: ChainBaseConfig[] = [...configs];
  for (const config of innerConfigs) {
    const customConfigIndex = finalConfigs.findIndex(
      (item) => item.uniqueId === config.uniqueId,
    );
    if (customConfigIndex >= 0) {
      finalConfigs[customConfigIndex] = {
        ...config,
        rpcList: finalConfigs[customConfigIndex].rpcList,
        chainName: finalConfigs[customConfigIndex].chainName,
        nativeCurrency: finalConfigs[customConfigIndex].nativeCurrency,
      };
    } else {
      finalConfigs.push(config);
    }
  }
  return finalConfigs;
};

export const useChainConfigs = (uniqueIds: ChainUniqueId[]) => {
  return useSelector((state: RootState) => {
    const allChainConfigs = allChainConfigsSelector(state);
    // 确保不包含已废弃的网络
    const availableUniqueIds = uniqueIds.filter((uniqueId) =>
      allChainConfigs.some((cfg) => cfg.uniqueId === uniqueId),
    );
    return availableUniqueIds.map((uniqueId) =>
      getChainConfig({ state, uniqueId }),
    );
  }, isEqual);
};
