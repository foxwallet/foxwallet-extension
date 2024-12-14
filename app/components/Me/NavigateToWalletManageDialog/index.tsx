import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "@/common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const NavigateToWalletManageDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      title={t("Common:remind")}
      body={<P3 textAlign={"center"}>{t("Networks:remind")}</P3>}
      footer={
        <Flex flex={1}>
          <Button flex={1} mr="2" colorScheme="secondary" onClick={onConfirm}>
            {t("Networks:manageWallet")}
          </Button>
          <Button flex={1} ml="2" onClick={onCancel}>
            {t("Common:cancel")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showNavigateToWalletManageDialog = promisifyChooseDialogWrapper(
  NavigateToWalletManageDialog,
);
