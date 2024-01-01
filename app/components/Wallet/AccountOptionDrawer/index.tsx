import { Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useCallback, useMemo } from "react";
import { BottomUpDrawer } from "@/components/Custom/BottomUpDrawer";
import { useTranslation } from "react-i18next";
import { IconDelete, IconExportPhrase } from "@/components/Custom/Icon";
import { SelectedAccount } from "@/scripts/background/store/vault/types/keyring";

export enum AccountOperateOptions {
  ExportPrivateKey,
  ChangeVisibility,
}

interface Props {
  account: SelectedAccount;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onClickOption: (option: AccountOperateOptions) => void;
}

const AccountOptionDrawer = (props: Props) => {
  const { account, isOpen, onCancel, onConfirm, onClickOption } = props;
  const { t } = useTranslation();

  const handleExportPrivateKey = useCallback(() => {
    onClickOption(AccountOperateOptions.ExportPrivateKey);
    onConfirm?.();
  }, [onConfirm, onClickOption]);

  const handleChangeVisibility = useCallback(() => {
    onClickOption(AccountOperateOptions.ChangeVisibility);
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
            <Text ml={2.5} color={"#000"} fontSize={12} fontWeight={500}>
              {t("Wallet:Export:privateKey")}
            </Text>
          </Flex>
          <Flex
            align={"center"}
            as={"button"}
            mb={1}
            onClick={handleChangeVisibility}
          >
            <IconDelete />
            <Text ml={2.5} color={"#EF466F"} fontSize={12} fontWeight={500}>
              Hide
            </Text>
          </Flex>
        </Flex>
      }
    />
  );
};

export const showAccountOptionDrawer =
  promisifyChooseDialogWrapper(AccountOptionDrawer);
