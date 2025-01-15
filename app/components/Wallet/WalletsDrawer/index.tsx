import { Button, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "@/common/utils/dialog";
import { BasicDrawer } from "@/components/Custom/Drawer";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import { IconArrowRight, IconCheckLineBlack } from "@/components/Custom/Icon";
import type React from "react";
import { useMemo, useCallback } from "react";
import { usePopupDispatch } from "@/hooks/useStore";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { H6 } from "@/common/theme/components/text";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { type OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";

interface AccountListItemProps {
  account: OneMatchGroupAccount;
  isSelected: boolean;
  onSelected: (account: OneMatchGroupAccount) => void;
}
const AccountListItem: React.FC<AccountListItemProps> = ({
  account,
  isSelected,
  onSelected,
}) => {
  const handleSelected = useCallback(() => {
    onSelected(account);
  }, [account, onSelected]);

  const { selectedBorderColor, borderColor } = useThemeStyle();
  return (
    <Flex
      borderWidth={1}
      borderColor={isSelected ? selectedBorderColor : borderColor}
      borderRadius={8}
      px={2.5}
      mt={2.5}
      align={"center"}
      justify={"space-between"}
      minH={"52px"}
      onClick={handleSelected}
    >
      <Flex direction={"column"}>
        <Text fontSize={13} fontWeight={500} align={"start"}>
          {account.group.groupName}
        </Text>
      </Flex>
      {isSelected && <IconCheckLineBlack height={18} width={18} />}
    </Flex>
  );
};

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onManageWallet: () => void;
}

const WalletsDrawer = (props: Props) => {
  const { isOpen, onCancel, onConfirm, onManageWallet } = props;
  const { t } = useTranslation();
  const { groupAccount } = useGroupAccount();
  const { selectedWallet, groupAccountsInWallet } = useCurrWallet();
  const dispatch = usePopupDispatch();
  const { addAccount } = useWallets();

  const walletId = useMemo(() => {
    return selectedWallet?.walletId ?? "";
  }, [selectedWallet]);

  const onAddAccount = useCallback(() => {
    void addAccount(walletId, nanoid());
  }, [addAccount, walletId]);

  const handleManageWallet = useCallback(() => {
    onConfirm?.();
    onManageWallet?.();
  }, [onManageWallet, onConfirm]);

  const onSelectAccount = useCallback(
    (account: OneMatchGroupAccount) => {
      if (!selectedWallet?.walletId) return;

      void dispatch.accountV2.setSelectedGroupAccount({
        selectedGroupAccount: account,
      });
      onConfirm?.();
    },
    [dispatch.accountV2, selectedWallet?.walletId, onConfirm],
  );

  const renderAccountItem = useCallback(
    (account: OneMatchGroupAccount, index: number) => {
      const isSelected = groupAccount.group.groupId === account.group.groupId;
      return (
        <AccountListItem
          key={`${account.group.groupId}${index}`}
          account={account}
          isSelected={isSelected}
          onSelected={onSelectAccount}
        />
      );
    },
    [groupAccount.group.groupId, onSelectAccount],
  );

  return (
    <BasicDrawer
      isOpen={isOpen}
      onClose={onCancel}
      titleElement={
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          onClick={handleManageWallet}
        >
          <H6>{selectedWallet?.walletName}</H6>
          <IconArrowRight w={18} h={18} ml={0.5} />
        </Flex>
      }
      body={
        <Flex flexDirection={"column"} px={1.5}>
          <Flex
            direction={"column"}
            maxH={400}
            overflowY="auto"
            sx={HIDE_SCROLL_BAR_CSS}
          >
            {groupAccountsInWallet.map(renderAccountItem)}
          </Flex>
        </Flex>
      }
      footer={
        <Flex justify={"space-between"} flex={1}>
          <Button flex={1} onClick={onAddAccount}>
            {t("Wallet:Manage:addAccount")}
          </Button>
        </Flex>
      }
    />
  );
};

export const showWalletsDrawer = promisifyChooseDialogWrapper(WalletsDrawer);
