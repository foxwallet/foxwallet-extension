import { Image, Center, Text } from "@chakra-ui/react";
import Qrcode from "@/common/assets/image/qrcode.png";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { BasicModal } from "@/components/Custom/Modal";
import { t } from "i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const downloadDialog = (props: Props) => {
  const { isOpen, onClose } = props;

  const body = () => (
    <div>
      <Text textAlign="center">{t("Stake:dialogContent")}</Text>
      <Center>
        <Image src={Qrcode} alt="qrcode" boxSize="170px" />
      </Center>
    </div>
  );

  return (
    <BasicModal
      isOpen={isOpen}
      title={t("Stake:dialogTitle")}
      body={body()}
      onClose={onClose}
    />
  );
};

export const showDownloadDialog = promisifyChooseDialogWrapper(downloadDialog);
