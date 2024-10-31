import { useTranslation } from "react-i18next";
import { Image, Center, Text } from "@chakra-ui/react";
import Qrcode from '@/common/assets/image/qrcode.png';
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { BasicModal } from '@/components/Custom/Modal'

interface Props {
  isOpen: boolean;
  onClose: () => void
}

const downloadDialog = (props: Props) => {
  const { isOpen, onClose } = props;
  const { t } = useTranslation();

  const body = () => <div>
    <Text textAlign="center">
      {t("Stake:dialogContent")}
    </Text>
    <Center>
      <Image src={Qrcode} alt="qrcode" boxSize='170px' />
    </Center>
  </div>

  return (
    <BasicModal
      isOpen={isOpen} title={t("Stake:dialogTitle")} body={body()} onClose={onClose} />
  );
};

export const showDownloadDialog =
  promisifyChooseDialogWrapper(downloadDialog);
