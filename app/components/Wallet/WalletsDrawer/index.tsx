import { Box, Flex, Text } from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { BasicDrawer } from "@/components/Custom/Drawer";
import { useCurrWallet } from "@/hooks/useWallets";
import {
  IconAleo,
  IconArrowRight,
  IconCheckLineBlack,
} from "@/components/Custom/Icon";
import React, { useCallback } from "react";
import { DisplayAccount } from "@/scripts/background/store/vault/types/keyring";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { usePopupDispatch } from "@/hooks/useStore";
import { CoinType } from "core/types";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { H6 } from "@/common/theme/components/text";
import { useNavigate } from "react-router-dom";

interface AccountListItemProps {
  account: DisplayAccount;
  isSelected: boolean;
  onSelected: (account: DisplayAccount) => void;
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
          {account.accountName}
        </Text>
        <Box fontSize={9} color={"#777E90"} noOfLines={1}>
          <MiddleEllipsisText text={account.address} width={260} />
        </Box>
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

  const { selectedAccount } = useCurrAccount();
  const { selectedWallet, accountsInWallet } = useCurrWallet();
  const dispatch = usePopupDispatch();

  const handleManageWallet = useCallback(() => {
    onConfirm?.();
    onManageWallet?.();
  }, [onManageWallet, onConfirm]);

  const onSelectAccount = useCallback(
    (account: DisplayAccount) => {
      if (!selectedWallet?.walletId) return;

      dispatch.account.setSelectedAccount({
        selectedAccount: {
          walletId: selectedWallet?.walletId,
          coinType: CoinType.ALEO,
          ...account,
          accountName: account.accountName,
        },
      });
      onConfirm?.();
    },
    [dispatch.account, selectedWallet?.walletId, onConfirm],
  );

  const renderAccountItem = useCallback(
    (account: DisplayAccount, index: number) => {
      const isSelected = selectedAccount.accountId === account.accountId;
      return (
        <AccountListItem
          key={`${account.accountId}${index}`}
          account={account}
          isSelected={isSelected}
          onSelected={onSelectAccount}
        />
      );
    },
    [selectedAccount.accountId, onSelectAccount],
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
          <Flex align={"center"} justify={"flex-start"}>
            <IconAleo />
            <Text ml={1} fontSize={14} fontWeight={500}>
              ALEO
            </Text>
          </Flex>
          <Flex direction={"column"} maxH={190} overflowY="auto">
            {accountsInWallet.map(renderAccountItem)}
          </Flex>
        </Flex>
      }
    />
  );
};

export const showWalletsDrawer = promisifyChooseDialogWrapper(WalletsDrawer);
