import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const PasswordWarningDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      title={"Warning"}
      body={
        <P3>
          {
            "The password strength is too low, the wallet assets will be insecure."
          }
        </P3>
      }
      footer={
        <Flex flex={1}>
          <Button flex={1} mr="2" onClick={onCancel}>
            Change
          </Button>
          <Button flex={1} ml="2" colorScheme="secondary" onClick={onConfirm}>
            Still create
          </Button>
        </Flex>
      }
    />
  );
};

export const showPasswordWarningDialog = promisifyChooseDialogWrapper(
  PasswordWarningDialog,
);
