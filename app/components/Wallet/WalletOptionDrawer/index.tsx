import { Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useCallback, useMemo } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import { IconDelete, IconExportPhrase } from "@/components/Custom/Icon";
import {
  DisplayWallet,
  WalletType,
} from "@/scripts/background/store/vault/types/keyring";
import { usePopupSelector } from "@/hooks/useStore";
import { isEqual } from "lodash";

export enum WalletOperateOption {
  ExportPhrase,
  BackupMnemonic,
  Delete,
}

interface Props {
  wallet: DisplayWallet;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onClickOption: (option: WalletOperateOption) => void;
}

const WalletOptionDrawer = (props: Props) => {
  const { wallet, isOpen, onCancel, onConfirm, onClickOption } = props;
  const { t } = useTranslation();

  const walletBackupMnemonicMap = usePopupSelector(
    (state) => state.accountV2.walletBackupMnemonicMap,
    isEqual,
  );
  const isBackuped = useMemo(
    () => walletBackupMnemonicMap[wallet.walletId],
    [walletBackupMnemonicMap, wallet.walletId],
  );

  const handleExportPhrase = useCallback(() => {
    if (isBackuped) {
      onClickOption(WalletOperateOption.ExportPhrase);
    } else {
      onClickOption(WalletOperateOption.BackupMnemonic);
    }
    onConfirm?.();
  }, [onConfirm, onClickOption, isBackuped]);

  const handleDelete = useCallback(() => {
    onClickOption(WalletOperateOption.Delete);
    onConfirm?.();
  }, [onConfirm, onClickOption]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Common:more")}
      body={
        <Flex flexDirection={"column"}>
          {wallet.walletType === WalletType.HD && (
            <Flex
              align={"center"}
              as={"button"}
              mb={4}
              onClick={handleExportPhrase}
            >
              <IconExportPhrase />
              <Text ml={2.5} fontSize={12} fontWeight={500}>
                {isBackuped
                  ? t("Wallet:Export:seedPhrase")
                  : t("Wallet:Create:backupMnemonic")}
              </Text>
            </Flex>
          )}
          <Flex align={"center"} as={"button"} mb={1} onClick={handleDelete}>
            <IconDelete />
            <Text ml={2.5} color={"#EF466F"} fontSize={12} fontWeight={500}>
              {t("Wallet:Manage:delete")}
            </Text>
          </Flex>
        </Flex>
      }
    />
  );
};

export const showWalletOptionDrawer =
  promisifyChooseDialogWrapper(WalletOptionDrawer);
