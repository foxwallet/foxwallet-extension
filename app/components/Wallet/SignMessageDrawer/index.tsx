import { Button, Flex, Text } from "@chakra-ui/react";
import { BasicModal } from "../../Custom/Modal";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  address: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const SignMessageDrawer = (props: Props) => {
  const { isOpen, onConfirm, onCancel, address, message } = props;
  const { t } = useTranslation();

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onCancel}
      title={t("SignMessage:title")}
      body={
        <Flex flexDir={"column"}>
          <Text fontWeight={"bold"}>{t("Common:account")}</Text>
          <Text maxW={"90%"} wordBreak={"break-all"}>
            {address}
          </Text>
          <Text mt={"2"} fontWeight={"bold"}>
            {t("SignMessage:message")}
          </Text>
          {message.split("\n").map((line, index) => (
            <Text key={index} maxW={"90%"} wordBreak={"break-all"}>
              {line}
            </Text>
          ))}
        </Flex>
      }
      footer={
        <Flex flex={1}>
          <Button flex={1} mr={"2"} colorScheme="secondary" onClick={onCancel}>
            {t("Common:cancel")}
          </Button>
          <Button flex={1} ml={"2"} onClick={onConfirm}>
            {t("SignMessage:sign")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showSignMessageDialog =
  promisifyChooseDialogWrapper(SignMessageDrawer);
