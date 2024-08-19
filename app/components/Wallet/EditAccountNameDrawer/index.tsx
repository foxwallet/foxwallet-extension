import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import React, { useCallback, useMemo, useState } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { BaseInput } from "@/components/Custom/Input";
import { useTranslation } from "react-i18next";
import { WarningArea } from "@/components/Custom/WarningArea";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";
import { OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";
import { dupGroupNameSelector } from "@/store/selectors/account";

interface Props {
  account: OneMatchGroupAccount;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const EditAccountNameDrawer = (props: Props) => {
  const { account, isOpen, onCancel, onConfirm } = props;
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const allWalletInfo = usePopupSelector(
    (state) => state.accountV2.allWalletInfo,
    isEqual,
  );
  const walletOfAccount = allWalletInfo[account.wallet.walletId];

  const [accountName, setAccountName] = useState(account.group.groupName);

  const onAccountNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setAccountName(value);
    },
    [setAccountName],
  );

  const handleConfirmName = useCallback(async () => {
    if (!accountName) return;
    dispatch.accountV2.changeAccountName({
      walletId: walletOfAccount.walletId,
      groupId: account.group.groupId,
      accountName,
    });
    onConfirm?.();
  }, [onConfirm, accountName, dispatch.accountV2, account, walletOfAccount]);

  const dupAccountName = usePopupSelector(
    (state) =>
      dupGroupNameSelector(state, {
        walletId: account.wallet.walletId,
        groupName: accountName ?? "",
      }),
    isEqual,
  );

  const isInvalidName = useMemo(() => {
    return !accountName || dupAccountName;
  }, [accountName, dupAccountName]);

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
          {dupAccountName && (
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
