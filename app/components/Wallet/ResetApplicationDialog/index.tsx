import { Button, Flex, Box } from "@chakra-ui/react";
import { P3 } from "@/common/theme/components/text";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ResetApplicationDialog = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);

  const onConfirmDelete = useCallback(() => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      onConfirm();
    }
  }, [onConfirm, step]);

  const body = useMemo(() => {
    return step === 1 ? (
      <Box textAlign={"center"}>
        <P3>
          {t("Reset:warningContent1")}
          <P3 as="span" color="#EF466F">
            {t("Reset:warningStrong")}
          </P3>
        </P3>
        <P3 mt={1}> {t("Reset:warningContent2")}</P3>
      </Box>
    ) : (
      <P3 color="#EF466F">{t("Reset:warningStrong")}</P3>
    );
  }, [step, t]);

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      hideClose={true}
      isCentered
      title={step === 1 ? t("Reset:warningTitle") : t("Reset:warningTitle2")}
      titleStyle={
        step === 1
          ? {
              color: "#EF466F",
              textAlign: "center",
            }
          : { textAlign: "center" }
      }
      body={body}
      footer={
        <Flex flex={1}>
          <Button
            flex={1}
            mr="2"
            colorScheme="secondary"
            onClick={onConfirmDelete}
          >
            {step === 1 ? t("Common:confirm") : t("Reset:confirmDelete")}
          </Button>
          <Button flex={1} ml="2" onClick={onCancel}>
            {t("Common:cancel")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showResetApplicationDialog = promisifyChooseDialogWrapper(
  ResetApplicationDialog,
);
