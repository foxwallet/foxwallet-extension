import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import React, { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInput } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { WarningArea } from "@/components/Custom/WarningArea";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditWalletNameDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const { walletList } = useWallets();
  const { selectedWallet, changeWalletName } = useCurrWallet();

  const [walletName, setWalletName] = useState(selectedWallet?.walletName);

  const onWalletNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setWalletName(value);
    },
    [setWalletName],
  );

  const handleConfirmName = useCallback(async () => {
    if (!walletName) return;

    await changeWalletName(selectedWallet!.walletId, walletName);
    onConfirm?.();
  }, [onConfirm, walletName, changeWalletName, selectedWallet?.walletId]);

  const dupWalletName = useMemo(() => {
    if (!walletName) return false;
    return walletList?.some(
      (item) =>
        item.walletName === walletName &&
        walletName !== selectedWallet?.walletName,
    );
  }, [walletList, walletName, selectedWallet?.walletName]);

  const isInvalidName = useMemo(() => {
    return !walletName || dupWalletName;
  }, [walletName, dupWalletName]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Wallet:Manage:changeName")}
      body={
        <Flex flexDirection={"column"}>
          <Text mb={1}>{t("Wallet:Create:walletName")}</Text>
          <BaseInput
            placeholder={t("Wallet:Create:walletNamePlaceholder")}
            value={walletName}
            onChange={onWalletNameChange}
            isInvalid={isInvalidName}
          />
          {dupWalletName && (
            <WarningArea
              container={{ mt: "2" }}
              content={t("Wallet:Create:dupWalletName")}
            />
          )}
        </Flex>
      }
      footer={
        <Flex justify={"space-between"} flex={1}>
          <Button
            flex={1}
            isDisabled={isInvalidName}
            onClick={handleConfirmName}
          >
            {t("Common:confirm")}
          </Button>
          <Button flex={1} ml={3} onClick={onCancel} colorScheme="normal">
            {t("Common:cancel")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showEditWalletNameDrawer =
  promisifyChooseDialogWrapper(EditWalletNameDrawer);
