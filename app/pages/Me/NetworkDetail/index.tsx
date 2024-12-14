import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { useTranslation } from "react-i18next";
import { Box } from "@chakra-ui/react";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { useDebounce } from "use-debounce";
import { useParams } from "react-router-dom";
import { useCoinService } from "@/hooks/useCoinService";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import { BaseInput } from "@/components/Custom/Input";

const NetworkDetailScreen = () => {
  const { uniqueId } = useParams();
  const { nativeCurrency, chainConfig, coinService } = useCoinService(
    uniqueId as InnerChainUniqueId,
  );
  const { t } = useTranslation();

  const [rpcUrl, setRpcUrl] = useState<string>("");
  const [debounceRpcUrl] = useDebounce(rpcUrl, 500);

  const onRpcUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRpcUrl(event.target.value);
    },
    [],
  );

  // todo: rpc manage

  return (
    <PageWithHeader title={t("Networks:networkDetail")}>
      <Content>
        <Box overflowY="auto" maxHeight={"calc(100vh - 90px)"}>
          <BaseInput
            title={t("Networks:networkName")}
            container={{ mt: "2" }}
            value={chainConfig.chainName}
            isDisabled={true}
          />
          <BaseInput
            title={t("Networks:symbol")}
            container={{ mt: "2" }}
            value={chainConfig.nativeCurrency.symbol}
            isDisabled={true}
          />
          <BaseInput
            title={t("Networks:rpc")}
            placeholder={t("Networks:rpcHint")}
            container={{ mt: "2" }}
            value={rpcUrl}
            onChange={onRpcUrlChange}
            // isInvalid={true}
          />
        </Box>
      </Content>
    </PageWithHeader>
  );
};

export default NetworkDetailScreen;
