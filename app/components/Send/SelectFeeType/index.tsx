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
import { L1, P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";

interface Props {
  isOpen: boolean;
  onConfirm: (data: AleoFeeMethod) => void;
  onCancel: () => void;
}

const SelectFeeTypeDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;

  const transferMethods = useMemo(() => {
    return Object.values(AleoFeeMethod);
  }, []);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={6} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          Transfer Method
        </DrawerHeader>
        <DrawerBody>
          <Flex direction={"column"}>
            {transferMethods.map((method) => (
              <L1
                key={method}
                flex={1}
                mt="2"
                px={"4"}
                border="1px solid"
                borderColor={"gray.500"}
                borderRadius={"sm"}
                onClick={() => onConfirm(method)}
              >
                {method}
              </L1>
            ))}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      title={"Fee Method"}
      body={
        <Flex direction={"column"}>
          {transferMethods.map((method) => (
            <Button
              key={method}
              flex={1}
              mx="2"
              mt="2"
              onClick={() => onConfirm(method)}
            >
              {method}
            </Button>
          ))}
        </Flex>
      }
    />
  );
};

export const showSelectFeeTypeDialog =
  promisifyChooseDialogWrapper(SelectFeeTypeDrawer);
