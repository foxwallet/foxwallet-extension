import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

function OnboardHomeScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );

  const haveBalance = !loadingBalance && !!balance?.total && balance.total > 0;

  const onClickSend = useCallback(() => {
    navigate("/send_aleo");
  }, [navigate]);

  const onClickReceive = useCallback(() => {
    navigate("/receive");
  }, [navigate]);

  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      <Text>{balance?.total.toString()}</Text>
      <Button isDisabled={!haveBalance} onClick={onClickSend} mx="8">
        Send
      </Button>
      <Button onClick={onClickReceive} mx="8">
        Receive
      </Button>
    </Flex>
  );
}

export default OnboardHomeScreen;
