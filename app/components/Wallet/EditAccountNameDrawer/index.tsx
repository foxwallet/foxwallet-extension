import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useCurrWallet } from "@/hooks/useWallets";
import React, { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInput } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { WarningArea } from "@/components/Custom/WarningArea";
import { SelectedAccount } from "@/scripts/background/store/vault/types/keyring";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { CoinType } from "core/types";

interface Props {
  account: SelectedAccount;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditAccountNameDrawer = (props: Props) => {
  const { account, isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const allWalletInfo = usePopupSelector(
    (state) => state.account.allWalletInfo,
    isEqual,
  );
  const walletOfAccount = allWalletInfo[account.walletId];

  const [accountName, setAccountName] = useState(account.accountName);

  const onAccountNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setAccountName(value);
    },
    [setAccountName],
  );

  const handleConfirmName = useCallback(async () => {
    if (!accountName) return;
    dispatch.account.changeAccountName({
      walletId: walletOfAccount.walletId,
      accountId: account.accountId,
      accountName,
    });
    onConfirm?.();
  }, [onConfirm, accountName, dispatch.account, account, walletOfAccount]);

  const dupWalletName = useMemo(() => {
    if (!accountName) return false;
    const coinType = CoinType.ALEO;
    return walletOfAccount.accountsMap[coinType]?.some(
      (item) =>
        item.accountName === accountName && accountName !== account.accountName,
    );
  }, [walletOfAccount, accountName, account]);

  const isInvalidName = useMemo(() => {
    return !accountName || dupWalletName;
  }, [accountName, dupWalletName]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Wallet:Manage:changeAccountName")}
      body={
        <Flex flexDirection={"column"}>
          <Text mb={1}>{t("Wallet:Manage:accountName")}</Text>
          <BaseInput
            placeholder={t("Wallet:Manage:accountNamePlaceholder")}
            value={accountName}
            onChange={onAccountNameChange}
            isInvalid={isInvalidName}
          />
          {dupWalletName && (
            <WarningArea
              container={{ mt: "2" }}
              content={t("Wallet:Create:dupAccountName")}
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

export const showEditAccountNameDrawer = promisifyChooseDialogWrapper(
  EditAccountNameDrawer,
);
