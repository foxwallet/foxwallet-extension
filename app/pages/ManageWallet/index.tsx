import { PageWithHeader } from "@/layouts/Page";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrWallet, useWallets } from "@/hooks/useWallets";
import { DisplayWallet } from "@/scripts/background/store/vault/types/keyring";
import { useTranslation } from "react-i18next";
import { IconCheckLineBlack } from "@/components/Custom/Icon";
import { showEditWalletNameDrawer } from "@/components/Wallet/EditWalletNameDrawer";
import { useClient } from "@/hooks/useClient";

interface WalletListItemProps {
  wallet: DisplayWallet;
  isSelected: boolean;
  onSelected: (wallet: DisplayWallet) => void;
}
const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  isSelected,
  onSelected,
}) => {
  const { t } = useTranslation();
  const handleSelected = useCallback(() => {
    onSelected(wallet);
  }, [wallet, onSelected]);

  return (
    <Flex
      borderWidth={1}
      borderColor={isSelected ? "#000" : "#E6E8EC"}
      borderRadius={8}
      pl={2.5}
      pr={2}
      mt={2.5}
      align={"center"}
      justify={"space-between"}
      minH={"38px"}
      as={"button"}
      onClick={handleSelected}
    >
      <Flex>
        {isSelected ? (
          <IconCheckLineBlack height={18} width={18} />
        ) : (
          <Box height={18} width={18} />
        )}
        <Text
          ml={1}
          fontSize={12}
          fontWeight={500}
          color={"#000"}
          align={"start"}
        >
          {wallet.walletName}
        </Text>
      </Flex>
      <Text
        fontSize={10}
        color={"#777E90"}
        as={"button"}
        onClick={() => alert("accounts")}
        px={0.5}
        borderRadius={"4px"}
        _hover={{ backgroundColor: "#F5F5F5" }}
      >
        {t("Wallet:Manage:checkAccounts")}
      </Text>
    </Flex>
  );
};

function ManageWalletScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { walletInfo } = useCurrWallet();
  const { flattenWalletList } = useWallets();

  const onSelectWallet = useCallback((wallet: DisplayWallet) => {}, []);

  const onEdit = useCallback(() => {
    showEditWalletNameDrawer();
  }, [showEditWalletNameDrawer]);

  const renderWalletItem = useCallback(
    (wallet: DisplayWallet, index: number) => {
      const isSelected = walletInfo?.walletId === wallet.walletId;
      return (
        <WalletListItem
          key={`${wallet.walletId}${index}`}
          wallet={wallet}
          isSelected={isSelected}
          onSelected={onSelectWallet}
        />
      );
    },
    [walletInfo?.walletId],
  );

  return (
    <PageWithHeader
      enableBack
      title={t("Wallet:Manage:title")}
      rightIcon={
        <Box mr={2} fontSize={12} fontWeight={500} as="button" onClick={onEdit}>
          {t("Common:edit")}
        </Box>
      }
    >
      <Flex direction={"column"} flex={1} px={5} pb={4}>
        <Flex
          direction={"column"}
          maxH={470}
          overflowY="auto"
          sx={{
            scrollbarWidth: "none",
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {flattenWalletList.map(renderWalletItem)}
        </Flex>
        <Button
          position={"absolute"}
          bottom={5}
          left={5}
          right={5}
          onClick={() => navigate("/create_wallet")}
        >
          {t("Wallet:Manage:addWallet")}
        </Button>
      </Flex>
    </PageWithHeader>
  );
}

export default ManageWalletScreen;
