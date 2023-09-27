import { Button, Flex } from "@chakra-ui/react";
import { H6, P3, P4 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { IconPreventScreenshot } from "../../Custom/Icon";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const MnemonicWarningDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;

  return (
    <BasicModal
      isOpen={isOpen}
      hideClose={true}
      onClose={onCancel}
      body={
        <Flex flexDirection={"column"} alignItems={"center"}>
          <IconPreventScreenshot w={"12"} h={"12"} mb={2} />
          <H6 mb={2}>{"Don't take screenshot"}</H6>
          <P4>
            {
              "Obtaining the mnemonic phrase is equivalent to obtaining the ownership of the asset. To prevent leakage, it is recommended not to take screenshots or record the screen, and make sure that there is no camera around. Please do not share the mnemonic phrase with others to prevent asset loss due to fraud."
            }
          </P4>
        </Flex>
      }
      footer={
        <Button flex={1} onClick={onConfirm} mt={2}>
          Confirm
        </Button>
      }
    />
  );
};

export const showMnemonicWarningDialog = promisifyChooseDialogWrapper(
  MnemonicWarningDialog
);
