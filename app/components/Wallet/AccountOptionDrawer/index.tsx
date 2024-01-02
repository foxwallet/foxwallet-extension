import { Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useCallback, useMemo } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import {
  IconExportPhrase,
  IconEyeClose,
  IconEyeOn,
} from "@/components/Custom/Icon";
import {
  DisplayWallet,
  SelectedAccount,
} from "@/scripts/background/store/vault/types/keyring";
import { CoinType } from "core/types";

export enum AccountOperateOptions {
  ExportPrivateKey,
  ChangeVisibility,
}

interface Props {
  wallet: DisplayWallet;
  account: SelectedAccount;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onClickOption: (option: AccountOperateOptions) => void;
}

const AccountOptionDrawer = (props: Props) => {
  const { wallet, account, isOpen, onCancel, onConfirm, onClickOption } = props;
  const { t } = useTranslation();

  const handleExportPrivateKey = useCallback(() => {
    onClickOption(AccountOperateOptions.ExportPrivateKey);
    onConfirm?.();
  }, [onConfirm, onClickOption]);

  const handleChangeVisibility = useCallback(() => {
    onClickOption(AccountOperateOptions.ChangeVisibility);
    onConfirm?.();
  }, [onConfirm, onClickOption]);

  const accountStateText = useMemo(
    () => (account.hide ? t("Wallet:Export:show") : t("Wallet:Export:hide")),
    [account, t],
  );

  const showChangeStateOption = useMemo(() => {
    if (account.hide) return true;
    return (
      (wallet?.accountsMap?.[CoinType.ALEO] || []).filter((a) => !a.hide)
        .length > 1
    );
  }, [account, wallet.accountsMap]);

  return (
    <BottomUpDrawer
      isOpen={isOpen}
      onClose={onCancel}
      title={t("Common:more")}
      body={
        <Flex flexDirection={"column"}>
          <Flex
            align={"center"}
            as={"button"}
            mb={4}
            onClick={handleExportPrivateKey}
          >
            <IconExportPhrase />
            <Text ml={2.5} color={"#000"} fontSize={12} fontWeight={500}>
              {t("Wallet:Export:privateKey")}
            </Text>
          </Flex>
          {showChangeStateOption && (
            <Flex
              align={"center"}
              as={"button"}
              mb={1}
              onClick={handleChangeVisibility}
            >
              {account.hide ? (
                <IconEyeOn w={3.5} h={3.5} />
              ) : (
                <IconEyeClose w={3.5} h={3.5} />
              )}
              <Text ml={2.5} fontSize={12} fontWeight={500}>
                {accountStateText}
              </Text>
            </Flex>
          )}
        </Flex>
      }
    />
  );
};

export const showAccountOptionDrawer =
  promisifyChooseDialogWrapper(AccountOptionDrawer);
