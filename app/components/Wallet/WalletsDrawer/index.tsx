import { Box, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { BasicDrawer } from "@/components/Custom/Drawer";
import { useCurrWallet } from "@/hooks/useWallets";
import {
  IconAleo,
  IconCheckLineBlack,
  IconWallet,
} from "@/components/Custom/Icon";
import React, { useCallback } from "react";
import { usePopupDispatch } from "@/hooks/useStore";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { OneMatchGroupAccount } from "@/scripts/background/store/vault/types/keyring";

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
        {/* <Box fontSize={9} color={"#777E90"} noOfLines={1}>
          <MiddleEllipsisText text={account.address} width={260} />
        </Box> */}
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

  const { groupAccount } = useGroupAccount();
  const { selectedWallet, groupAccountsInWallet } = useCurrWallet();
  const dispatch = usePopupDispatch();

  const handleManageWallet = useCallback(() => {
    onConfirm?.();
    onManageWallet?.();
  }, [onManageWallet, onConfirm]);

  const onSelectAccount = useCallback(
    (account: OneMatchGroupAccount) => {
      if (!selectedWallet?.walletId) return;

      dispatch.accountV2.setSelectedGroupAccount({
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
      title={selectedWallet?.walletName}
      rightIcon={
        <Box cursor={"pointer"} pr={1} onClick={handleManageWallet}>
          <IconWallet />
        </Box>
      }
      body={
        <Flex flexDirection={"column"} px={1.5}>
          <Flex align={"center"} justify={"flex-start"}>
            <IconAleo />
            <Text ml={1} fontSize={14} fontWeight={500}>
              ALEO
            </Text>
          </Flex>
          <Flex direction={"column"} maxH={190} overflowY="auto">
            {groupAccountsInWallet.map(renderAccountItem)}
          </Flex>
        </Flex>
      }
    />
  );
};

export const showWalletsDrawer = promisifyChooseDialogWrapper(WalletsDrawer);
