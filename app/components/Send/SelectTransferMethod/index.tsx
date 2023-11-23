import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { useMemo } from "react";

interface Props {
  isOpen: boolean;
  onConfirm: (data: AleoTransferMethod) => void;
  onCancel: () => void;
}

const SelectTransferMethodDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;

  const transferMethods = useMemo(() => {
    return Object.values(AleoTransferMethod);
  }, []);

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      title={"Transfer Method"}
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

export const showSelectTransferMethodDialog = promisifyChooseDialogWrapper(
  SelectTransferMethodDrawer,
);
