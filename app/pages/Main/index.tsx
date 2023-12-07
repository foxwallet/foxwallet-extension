import { TokenNum } from "@/components/Wallet/TokenNum";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useTxHistory } from "@/hooks/useTxHistory";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text } from "@chakra-ui/react";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import {
  AleoHistoryItem,
  AleoTxAddressType,
} from "core/coins/ALEO/types/History";
import { AleoTxStatus } from "core/coins/ALEO/types/Tranaction";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

function OnboardHomeScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
    4000,
  );
  const { history, loading: loadingHistory } = useTxHistory(
    uniqueId,
    selectedAccount.address,
    4000,
  );

  const haveBalance = !loadingBalance && !!balance?.total && balance.total > 0;

  const onClickSend = useCallback(() => {
    navigate("/send_aleo");
  }, [navigate]);

  const onClickReceive = useCallback(() => {
    navigate("/receive");
  }, [navigate]);

  const renderHistoryItem = useCallback(
    (item: AleoHistoryItem) => {
      const { status, programId, functionName, addressType, amount, txId } =
        item;

      const statusPrefix = status === AleoTxStatus.FINALIZD ? "" : status;

      if (programId === NATIVE_TOKEN_PROGRAM_ID) {
        return (
          <Flex key={txId} mt={2}>
            {statusPrefix}&nbsp;
            {functionName.startsWith("transfer")
              ? functionName.slice(9)
              : functionName}
            &nbsp;
            {addressType}&nbsp;
            {amount && (
              <TokenNum
                amount={BigInt(amount)}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            )}
          </Flex>
        );
      }
      if (addressType === AleoTxAddressType.SEND) {
        return (
          <Flex key={txId} mt={2}>
            {statusPrefix}&nbsp;Call&nbsp;{programId}&nbsp;
            {functionName}
          </Flex>
        );
      }
      return (
        <Flex key={txId} mt={2}>
          {statusPrefix}&nbsp;Received from&nbsp;{programId}&nbsp;
          {functionName}
        </Flex>
      );
    },
    [nativeCurrency],
  );

  return (
    <Content>
      <Flex>
        Total balance:&nbsp;
        <TokenNum
          amount={balance?.total || 0n}
          decimals={nativeCurrency.decimals}
          symbol={nativeCurrency.symbol}
        />
      </Flex>
      <Flex>
        Private balance:&nbsp;
        <TokenNum
          amount={balance?.privateBalance || 0n}
          decimals={nativeCurrency.decimals}
          symbol={nativeCurrency.symbol}
        />
      </Flex>
      <Flex>
        Public balance:&nbsp;
        <TokenNum
          amount={balance?.publicBalance || 0n}
          decimals={nativeCurrency.decimals}
          symbol={nativeCurrency.symbol}
        />
      </Flex>
      <Flex>
        <Button isDisabled={!haveBalance} onClick={onClickSend} mr="2" flex="1">
          Send
        </Button>
        <Button onClick={onClickReceive} ml="4" flex={"1"}>
          Receive
        </Button>
      </Flex>
      {history && (
        <Flex maxH={400} overflowY={"auto"} direction={"column"}>
          {history.map((item) => {
            return renderHistoryItem(item);
          })}
        </Flex>
      )}
    </Content>
  );
}

export default OnboardHomeScreen;
