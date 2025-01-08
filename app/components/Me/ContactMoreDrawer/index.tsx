import { Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import type React from "react";
import { useCallback } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import { IconDelete, IconExportPhrase } from "@/components/Custom/Icon";
import { type AddressItemV2 } from "@/store/addressModel";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  item: AddressItemV2;
  onEditContact: (item: AddressItemV2) => void;
  onRemoveContact: (item: AddressItemV2) => {};
}

const ContactMoreDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm, item, onEditContact, onRemoveContact } =
    props;
  const { t } = useTranslation();
  const { showToast } = useCopyToast();

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(item.address);
    onConfirm?.();
    showToast();
  }, [item, onConfirm, showToast]);

  const onEdit = useCallback(() => {
    onEditContact(item);
    onConfirm?.();
  }, [item, onConfirm, onEditContact]);

  const onRemove = useCallback(() => {
    onRemoveContact(item);
    onConfirm?.();
  }, [item, onConfirm, onRemoveContact]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Common:more")}
      body={
        <Flex flexDirection={"column"}>
          {/* copy */}
          <Flex align={"center"} as={"button"} mb={4} onClick={onCopy}>
            <IconExportPhrase />
            <Text ml={2.5} fontSize={12} fontWeight={500}>
              {t("Contacts:copyAddress")}
            </Text>
          </Flex>
          {/* edit */}
          <Flex align={"center"} as={"button"} mb={4} onClick={onEdit}>
            <IconExportPhrase />
            <Text ml={2.5} fontSize={12} fontWeight={500}>
              {t("Contacts:editAddress")}
            </Text>
          </Flex>
          {/* remove */}
          <Flex align={"center"} as={"button"} mb={1} onClick={onRemove}>
            <IconDelete />
            <Text ml={2.5} color={"#EF466F"} fontSize={12} fontWeight={500}>
              {t("Contacts:remove")}
            </Text>
          </Flex>
        </Flex>
      }
    />
  );
};
export const showContactMoreDrawer =
  promisifyChooseDialogWrapper(ContactMoreDrawer);
