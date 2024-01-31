import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "../../../common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FaucetClaimedDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      title={t("Common:remind")}
      body={<P3 textAlign={"center"}>{t("Faucet:claimed")}</P3>}
      footer={
        <Flex flex={1}>
          <Button flex={1} onClick={onConfirm}>
            {t("Faucet:explorer")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showFaucetClaimedDialog =
  promisifyChooseDialogWrapper(FaucetClaimedDialog);
