import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
} from "@chakra-ui/react";
import { P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { NativeToken, NativeTokenWithAddress } from "core/types/Token";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { TokenNum } from "@/components/Wallet/TokenNum";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  transferInfo: {
    from: string;
    to: string;
    amount: bigint;
    gasFee: bigint;
    nativeCurrency: NativeToken;
    transferToken: NativeTokenWithAddress;
    transferMethod: AleoTransferMethod;
    feeType: AleoFeeMethod;
  };
}

const AleoTransferInfoDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel, transferInfo } = props;
  const {
    from,
    to,
    amount,
    gasFee,
    nativeCurrency,
    transferToken,
    transferMethod,
    feeType,
  } = transferInfo;

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={5} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          Transfer Info
        </DrawerHeader>
        <DrawerBody>
          <Flex direction={"column"}>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"From"}</P3>
              <P3>{from}</P3>
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"To"}</P3>
              <P3>{to}</P3>
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"Transfer Method"}</P3>
              <P3>{transferMethod}</P3>
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"Amount"}</P3>
              <TokenNum
                amount={amount}
                decimals={transferToken.decimals}
                symbol={transferToken.symbol}
              />
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"Fee Type"}</P3>
              <P3>{feeType}</P3>
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <P3 color={"gray.500"}>{"Gas Fee"}</P3>
              <TokenNum
                amount={gasFee}
                decimals={nativeCurrency.decimals}
                symbol={nativeCurrency.symbol}
              />
            </Flex>
            <Button flex={1} mx="2" mt="2" onClick={() => onConfirm()}>
              Confirm
            </Button>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showAleoTransferInfoDialog = promisifyChooseDialogWrapper(
  AleoTransferInfoDrawer,
);
