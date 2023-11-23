import { BaseInputGroup } from "@/components/Custom/Input";
import { showSelectTransferMethodDialog } from "@/components/Send/SelectTransferMethod";
import { useBalance } from "@/hooks/useBalance";
import { useCoinBasic } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, Text } from "@chakra-ui/react";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

function SendScreen() {
  const navigate = useNavigate();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const coinBasic = useCoinBasic(uniqueId);
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );

  const [receiverAddress, setReceiverAddress] = useState("");
  const [debounceReceiverAddress] = useDebounce(receiverAddress, 500);
  const [addressValid, setAddressValid] = useState(false);
  const onReceiverAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddressValid(true);
      setReceiverAddress(event.target.value);
    },
    [],
  );
  useEffect(() => {
    if (debounceReceiverAddress) {
      const valid = coinBasic.isValidAddress(debounceReceiverAddress);
      setAddressValid(valid);
    }
  }, [debounceReceiverAddress]);

  const [transferMethod, setTransferMethod] = useState(
    AleoTransferMethod.PUBLIC,
  );
  const onSelectTransferMethod = useCallback(async () => {
    const { data } = await showSelectTransferMethodDialog();
    if (data) {
      setTransferMethod(data);
    }
  }, []);

  return (
    <PageWithHeader enableBack title={"Send"}>
      <Flex>sender: {selectedAccount.address}</Flex>
      <Flex>balance: {balance?.total.toString()}</Flex>
      <Flex>private: {balance?.privateBalance.toString()}</Flex>
      <Flex>public: {balance?.publicBalance.toString()}</Flex>
      <BaseInputGroup
        container={{ mt: 2 }}
        title={"Password"}
        required
        inputProps={{
          placeholder: "Enter receiver address",
          onChange: onReceiverAddressChange,
          isInvalid: !!debounceReceiverAddress && !addressValid,
        }}
      />
      <Button onClick={onSelectTransferMethod}>{transferMethod}</Button>
    </PageWithHeader>
  );
}

export default SendScreen;
