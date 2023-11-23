import { useBalance } from "@/hooks/useBalance";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

function ReceiveScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );

  return (
    <Flex direction={"column"} w={"full"} h={"full"}>
      <Text>Receive</Text>
    </Flex>
  );
}

export default ReceiveScreen;
