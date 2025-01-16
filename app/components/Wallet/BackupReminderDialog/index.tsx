import { Button, Flex } from "@chakra-ui/react";
import { P3 } from "@/common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onBackup: () => void;
}

const BackupReminderDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel, onBackup } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={() => {}}
      hideClose
      isCentered
      title={t("Common:reminder")}
      body={<P3 textAlign={"center"}>{t("Wallet:backupTips")}</P3>}
      footer={
        <Flex flex={1}>
          <Button flex={1} mr="2" onClick={onBackup}>
            {t("Wallet:backupBtnTitle")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showBackupReminderDialog =
  promisifyChooseDialogWrapper(BackupReminderDialog);
