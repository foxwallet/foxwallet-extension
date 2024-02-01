import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  content: string;
  onChain: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FaucetClaimedDialog = (props: Props) => {
  const { content, onChain, isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      title={t("Common:remind")}
      body={<P3 textAlign={"center"}>{content}</P3>}
      footer={
        <Flex flex={1}>
          <Button flex={1} onClick={onChain ? onConfirm : onCancel}>
            {onChain ? t("Faucet:explorer") : t("Common:ok")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showFaucetClaimedDialog =
  promisifyChooseDialogWrapper(FaucetClaimedDialog);
