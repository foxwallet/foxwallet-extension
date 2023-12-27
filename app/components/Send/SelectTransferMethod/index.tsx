import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { L1, P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { useBalance } from "@/hooks/useBalance";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useCoinService } from "@/hooks/useCoinService";
import { IconCheckLine } from "@/components/Custom/Icon";
import { useRecords } from "@/hooks/useRecord";

interface Props {
  isOpen: boolean;
  selectedMethod: AleoTransferMethod;
  uniqueId: ChainUniqueId;
  address: string;
  onConfirm: (data: AleoTransferMethod) => void;
  onCancel: () => void;
}

const SelectTransferMethodDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel, uniqueId, address, selectedMethod } =
    props;
  const { nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance(uniqueId, address, 10000);
  const { records, loading: loadingRecords } = useRecords(uniqueId, address);

  const recordStr = useMemo(() => {
    if (!records) {
      return "";
    }
    if (records.length === 0) {
      return "No records";
    }
    return `${records.length} records, maximum`;
  }, [records]);

  const transferMethods = useMemo(() => {
    return Object.values(AleoTransferMethod);
  }, []);

  const transferMethodMap = useMemo(() => {
    return {
      [AleoTransferMethod.PUBLIC]: {
        title: "Public transfer",
        description: "Both the spender's and receiver's details are public.",
      },
      [AleoTransferMethod.PUBLIC_TO_PRIVATE]: {
        title: "Public balance to private record",
        description:
          "The sender's address and sent amount are public, but the receiver's details are in privacy.",
      },
      [AleoTransferMethod.PRIVATE]: {
        title: "Private transfer",
        description: "Sender's and receiver's details are in privacy.",
      },
      [AleoTransferMethod.PRIVATE_TO_PUBLIC]: {
        title: "Private record to public balance",
        description:
          "The sender's details are in privacy, but the receiver's address and received amount are public.",
      },
    };
  }, []);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={5} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          fontWeight={"semibold"}
        >
          Select Transfer Method
        </DrawerHeader>
        <DrawerBody>
          <Flex flexDir={"column"} pt={2} mt={3} fontSize={"smaller"}>
            <Flex justify={"space-between"}>
              <Text color={"gray.500"}>Public Balance</Text>
              {loadingBalance ? (
                <Spinner />
              ) : (
                <TokenNum
                  amount={balance?.publicBalance || 0n}
                  decimals={nativeCurrency.decimals}
                  symbol={nativeCurrency.symbol}
                />
              )}
            </Flex>
            <Flex justify={"space-between"} mt={2}>
              <Text color={"gray.500"}>Private Record</Text>
              <Flex flexDir={"column"} align={"flex-end"}>
                {loadingBalance ? (
                  <Spinner />
                ) : (
                  <TokenNum
                    amount={balance?.privateBalance || 0n}
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
                  />
                )}
                {!!recordStr && !!records[0] && (
                  <Flex>
                    (<Text>{recordStr}</Text>&nbsp;
                    <TokenNum
                      amount={records[0].parsedContent?.microcredits || 0n}
                      decimals={nativeCurrency.decimals}
                      symbol={nativeCurrency.symbol}
                    />
                    )
                  </Flex>
                )}
              </Flex>
            </Flex>
          </Flex>
          <Flex direction={"column"}>
            {transferMethods.map((method) => (
              <Flex flexDir={"column"}>
                <Flex
                  key={method}
                  flex={1}
                  mt="4"
                  px={4}
                  py={3}
                  border="1px solid"
                  borderColor={selectedMethod === method ? "black" : "gray.100"}
                  borderRadius={"lg"}
                  onClick={() => onConfirm(method)}
                  justify={"space-between"}
                >
                  <Text>{transferMethodMap[method].title}</Text>
                  {selectedMethod === method && (
                    <IconCheckLine w={"5"} h={"full"} stroke={"black"} />
                  )}
                </Flex>
                <Text fontSize={"smaller"} color={"gray.500"}>
                  {transferMethodMap[method].description}
                </Text>
              </Flex>
            ))}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectTransferMethodDialog = promisifyChooseDialogWrapper(
  SelectTransferMethodDrawer,
);
