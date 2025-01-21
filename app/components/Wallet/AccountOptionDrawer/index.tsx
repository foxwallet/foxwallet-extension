import { Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { useCallback } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import { IconExportPhrase } from "@/components/Custom/Icon";
import { type DisplayWallet } from "@/scripts/background/store/vault/types/keyring";

export enum AccountOperateOptions {
  ExportPrivateKey,
}

interface Props {
  wallet: DisplayWallet;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onClickOption: (option: AccountOperateOptions) => void;
}

const AccountOptionDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm, onClickOption } = props;
  const { t } = useTranslation();

  const handleExportPrivateKey = useCallback(() => {
    onClickOption(AccountOperateOptions.ExportPrivateKey);
    onConfirm?.();
  }, [onConfirm, onClickOption]);

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
            <Text ml={2.5} fontSize={12} fontWeight={500}>
              {t("Wallet:Export:privateKey")}
            </Text>
          </Flex>
        </Flex>
      }
    />
  );
};

export const showAccountOptionDrawer =
  promisifyChooseDialogWrapper(AccountOptionDrawer);
