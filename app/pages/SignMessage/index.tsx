import { ERROR_CODE } from "@/common/types/error";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useClient } from "@/hooks/useClient";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useDappRequest } from "@/hooks/useDappRequest";
import { useTxHistory } from "@/hooks/useTxHistory";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import {
  AleoHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { AleoTxStatus } from "core/coins/ALEO/types/Tranaction";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function SignMessageScreen() {
  const navigate = useNavigate();
  const { selectedAccount } = useCurrAccount();
  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { id, type, siteInfo, payload } = dappRequest;
    return (
      <Flex direction={"column"}>
        <Flex>{JSON.stringify(siteInfo)}</Flex>
        <Flex>{JSON.stringify(payload)}</Flex>
      </Flex>
    );
  }, [dappRequest]);

  const onConfirm = useCallback(() => {
    if (requestId && selectedAccount?.address) {
      popupServerClient.onRequestFinish({
        requestId,
      });
    }
  }, [popupServerClient, requestId, selectedAccount?.address]);

  const onCancel = useCallback(() => {
    if (requestId) {
      popupServerClient.onRequestFinish({
        requestId,
        error: ERROR_CODE.USER_CANCEL,
      });
    }
  }, []);

  return (
    <Content>
      <Flex>SignMessage</Flex>
      <Flex>{requestId}</Flex>
      <Flex>address: {selectedAccount?.address}</Flex>
      {dappRequestInfo}
      <Button onClick={onConfirm}>Confrim</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </Content>
  );
}

export default SignMessageScreen;
