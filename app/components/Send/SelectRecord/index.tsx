import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from "@chakra-ui/react";
import { L1, P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import { TokenNum } from "@/components/Wallet/TokenNum";
import { NativeToken } from "core/types/Token";

interface Props {
  isOpen: boolean;
  onConfirm: (data: RecordDetailWithSpent) => void;
  onCancel: () => void;
  recordList: RecordDetailWithSpent[];
  nativeCurrency: NativeToken;
}

const SelectRecordDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel, recordList, nativeCurrency } = props;

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
          Select record
        </DrawerHeader>
        <DrawerBody>
          <Flex direction={"column"} maxH={"400px"} overflowY={"auto"} pb={8}>
            {recordList.map((record, i) => (
              <Flex
                key={record.commitment}
                flex={1}
                mt="2"
                px={"4"}
                py={"4"}
                border="1px solid"
                borderColor={"gray.500"}
                borderRadius={"sm"}
                onClick={() => onConfirm(record)}
                justifyContent={"space-between"}
              >
                <Text>{i}</Text>
                <TokenNum
                  amount={record.parsedContent?.microcredits || 0n}
                  decimals={nativeCurrency.decimals}
                  symbol={nativeCurrency.symbol}
                />
              </Flex>
            ))}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectRecordDialog =
  promisifyChooseDialogWrapper(SelectRecordDrawer);
