import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "@/common/theme/components/text";
import { BasicModal } from "../Modal";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  content: string;
  confirmLabel?: string;
}

const ConfirmDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel, title, content, confirmLabel } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      title={title ?? t("Common:confirm")}
      body={<P3 textAlign={"center"}>{content}</P3>}
      footer={
        <Flex flex={1}>
          <Button flex={1} mr="2" onClick={onConfirm} colorScheme="secondary">
            {confirmLabel ?? t("Common:confirm")}
          </Button>
          <Button flex={1} ml="2" onClick={onCancel}>
            {t("Common:cancel")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showConfirmDialog = promisifyChooseDialogWrapper(ConfirmDialog);
