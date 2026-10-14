import { actions } from "@/store/actions";
import type React from "react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCoinService } from "@/hooks/useCoinService";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import RPCConfigTemplate from "@/pages/Dapp/AddChain/RPCConfigTemplate";
import type { ChainBaseConfig } from "core/types/ChainBaseConfig";
import { usePopupDispatch } from "@/hooks/useStore";
import { coinServiceEntry } from "core/coins/CoinServiceEntry";
import { isEthCustomRPC } from "core/coins/ETH/utils";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { useTranslation } from "react-i18next";

const NetworkDetailScreen = () => {
  const { uniqueId } = useParams();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { nativeCurrency, chainConfig, coinService } = useCoinService(
    uniqueId as InnerChainUniqueId,
  );

  const dispatch = usePopupDispatch();

  const onConfirm = useCallback(
    (newChainConfig: ChainBaseConfig) => {
      if (newChainConfig.rpcList?.length === 0) {
        void showErrorToast({ message: t("Networks:invalidRpc") });
        return;
      }
      dispatch(actions.multiChain.changeChainConfig({
        chainConfig: { ...chainConfig, ...newChainConfig },
      }));
      coinServiceEntry.rmCachedInstance(newChainConfig.uniqueId);
      navigate(-1);
    },
    [chainConfig, dispatch, navigate, t],
  );

  const onDelete = useCallback(() => {
    if (isEthCustomRPC(chainConfig.uniqueId)) {
      dispatch(actions.multiChain.removeChainConfig({
        chainConfig,
      }));
      coinServiceEntry.rmCachedInstance(chainConfig.uniqueId);
      navigate(-1);
    }
  }, [chainConfig, dispatch, navigate]);

  return (
    <RPCConfigTemplate
      defaultConf={chainConfig}
      onCancel={() => navigate(-1)}
      submitNew={onConfirm}
      onDelete={onDelete}
    />
  );
};

export default NetworkDetailScreen;
