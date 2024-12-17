import {
  IconArrowRight,
  IconCopy,
  IconEyeClose,
  IconEyeOn,
  IconFaucet,
  IconJoinSplit,
  IconLoading,
  IconLock,
  IconLogo,
  IconReceive,
  IconSend,
} from "@/components/Custom/Icon";
import {
  Box,
  Flex,
  type FlexProps,
  keyframes,
  Spinner,
  Text,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useAleoBalance } from "@/hooks/useAleoBalance";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import MiddleEllipsisText from "@/components/Custom/MiddleEllipsisText";
import { showWalletsDrawer } from "../WalletsDrawer";
import { useCurrWallet } from "@/hooks/useWallets";
import { useTranslation } from "react-i18next";
import RescanButton from "../RescanButton";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";
import Hover from "@/components/Custom/Hover";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useAuth } from "@/hooks/useAuth";
import Browser from "webextension-polyfill";
import {
  SelectJoinSplitOption,
  showSelectJoinSplitDialog,
} from "@/components/Send/SelectJoinSplit";
import { useFaucetStatus } from "@/hooks/useFaucetStatus";
import { FaucetStatus } from "core/coins/ALEO/types/Faucet";
import { showFaucetClaimedDialog } from "../FaucetClaimedDialog";
import { getCurrLanguage, SupportLanguages } from "@/locales/i18";
import { ExplorerLanguages } from "core/types/ExplorerLanguages";
import { chainUniqueIdToCoinType } from "core/helper/CoinType";
import { showSignMessageDialog } from "../SignMessageDrawer";
import { useClient } from "@/hooks/useClient";
import { showErrorToast } from "@/components/Custom/ErrorToast";
import { stringToHex } from "@/common/utils/hex";
import { useTxsNotification } from "@/hooks/useTxHistory";
import { NATIVE_TOKEN_PROGRAM_ID } from "core/coins/ALEO/constants";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import { type AleoService } from "core/coins/ALEO/service/AleoService";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { showChangeNetworkDrawer } from "@/components/Wallet/ChangeNetworkDrawer";
import { useBalance } from "@/hooks/useBalance";
import { ActionPanel } from "@/components/Wallet/ActionPanel";

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

export const HeaderMiddleView = ({
  onClick,
  title,
  showArrow = true,
}: {
  onClick: () => void;
  title: string;
  showArrow?: boolean;
}) => {
  return (
    <Flex
      cursor={"pointer"}
      onClick={onClick}
      flexDirection={"row"}
      align={"center"}
      bg={"#EBECEB"}
      minH={"24px"}
      pr={showArrow ? 0 : 2}
      pl={2}
      borderRadius={"5px"}
      position={"absolute"}
      left={"50%"}
      transform={"translateX(-50%)"}
    >
      <Text
        fontSize={12}
        lineHeight={4}
        fontWeight={500}
        maxW={100}
        noOfLines={1}
      >
        {title}
      </Text>
      {showArrow && <IconArrowRight w={18} h={18} />}
    </Flex>
  );
};

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();
  const {
    chainMode,
    chainModeName,
    availableChainUniqueIds,
    availableChains,
    availableAccounts,
    getSelectedAccountWithChain,
  } = useChainMode();

  const isAllMode = useMemo(() => {
    return chainMode.mode === ChainAssembleMode.ALL;
  }, [chainMode.mode]);

  // debugger;

  // TODO: 根据 chainMode 获取  asset
  const selectedAccount = useMemo(() => {
    if (chainMode.mode === ChainAssembleMode.ALL) {
      return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
    } else {
      return getMatchAccountsWithUniqueId(chainMode.uniqueId)[0];
    }
  }, [chainMode, getMatchAccountsWithUniqueId]);
  const uniqueId = availableChainUniqueIds[0];
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  // const { balance, loadingBalance } = useAleoBalance({
  //   uniqueId,
  //   programId: NATIVE_TOKEN_PROGRAM_ID,
  //   address: selectedAccount.account.address,
  //   refreshInterval: 4000,
  // });
  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.account.address,
    refreshInterval: 4000,
  });

  const { selectedWallet } = useCurrWallet();
  const { t } = useTranslation();
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);
  const dispatch = usePopupDispatch();
  const { showToast } = useCopyToast();
  // todo
  // const { onCopy } = useClipboard(selectedAccount.account.address);
  const { onCopy } = useClipboard("");

  const { sendingAleoTx } = useIsSendingAleoTx(uniqueId);
  const { lock } = useAuth();
  // todo
  // useTxsNotification(uniqueId, selectedAccount.account.address, 5000);

  const onChangeWallet = useCallback(() => {
    void showWalletsDrawer({
      onManageWallet: () => {
        navigate("/manage_wallet");
      },
    });
  }, [navigate]);

  const onCopyAddress = useCallback(() => {
    onCopy();
    showToast();
  }, [showToast, onCopy]);

  const copyAddress = useCallback(async () => {
    try {
      if (availableAccounts.length === 0) {
        throw new Error("Can't match account " + chainMode.mode);
      }
      if (availableChains.length === 0) {
        throw new Error(
          "Can't match uniqueId " +
            chainMode.mode +
            (chainMode.mode === ChainAssembleMode.SINGLE && chainMode.uniqueId),
        );
      }
      if (availableAccounts.length === 1 && availableChains.length === 1) {
        onCopy();
        showToast();
      }
      // const account = await showCopyAddressDrawer({
      //   accounts: availableAccounts,
      //   chainConfigs: availableChains,
      // });
      // Clipboard.setString(account.account.account.address);
      // global.$toast({
      //   content: t("Contact:copy_success"),
      //   icon: "success",
      // });
    } catch (err) {
      console.log("copyAddress err ", err);
    }
  }, [
    availableAccounts.length,
    availableChains.length,
    chainMode,
    onCopy,
    showToast,
  ]);

  const bgGradient = useColorModeValue(
    "linear(to-br, #ECFFF2, #FFFFFF, #ECFFF2)",
    "linear(to-br, #14321A, #000000, #14321A)",
  );
  const { borderColor, selectedBorderColor } = useThemeStyle();

  const onChangeNetwork = useCallback(async () => {
    await showChangeNetworkDrawer({
      title: groupAccount.wallet.walletName,
      chainMode,
      onWallet: () => {
        navigate("/manage_wallet");
      },
      onNetworks: () => {
        navigate("/networks");
      },
      onSelectNetwork: (data: ChainDisplayMode) => {
        dispatch.wallet.selectChain({
          walletId: groupAccount.wallet.walletId,
          selectedChain: data,
        });
      },
    });
  }, [chainMode, dispatch.wallet, groupAccount.wallet, navigate]);

  const copyAddressHint: string = useMemo(() => {
    if (availableAccounts.length === 1) {
      return availableAccounts[0].account.address;
    }
    return t("Common:copy");
  }, [availableAccounts, t]);

  return (
    <>
      <Box
        w="100%"
        px={5}
        py={5}
        bgGradient={bgGradient}
        borderBottomWidth={1}
        borderColor={borderColor}
      >
        {/* network, account and lock */}
        <Flex justify={"space-between"} align={"center"} position={"relative"}>
          <Flex
            justify={"center"}
            align={"center"}
            py={"3px"}
            pl={"3px"}
            pr={"4px"}
            h={26}
            borderRadius={13}
            borderWidth={"1px"}
            cursor={"pointer"}
            onClick={onChangeNetwork}
          >
            <IconLogo w={5} h={5} />
            <Text ml={"5px"} fontSize={"9px"}>
              {chainModeName}
            </Text>
            <IconArrowRight
              w={4}
              h={4}
              style={{ transform: "rotate(90deg)" }}
            />
          </Flex>
          <Flex
            align={"center"}
            justify={"center"}
            borderColor={selectedBorderColor}
            cursor={"pointer"}
            onClick={async () => lock()}
          >
            <IconLock w={5} h={5} />
          </Flex>
          <HeaderMiddleView
            onClick={onChangeWallet}
            title={groupAccount.group.groupName}
            showArrow={false}
          />
        </Flex>
        {/* copy address */}
        {chainMode.mode === ChainAssembleMode.SINGLE && (
          <Flex
            mt={2}
            direction={"row"}
            align={"center"}
            justifyContent={"center"}
          >
            <Hover onClick={onCopyAddress} bg={"#f9f9f9"} borderRadius={"5px"}>
              <Flex dir={"row"} align={"center"} justify={"center"} marginX={1}>
                <Box maxW={128} noOfLines={1} fontSize={11} color={"#777E90"}>
                  <MiddleEllipsisText text={copyAddressHint} width={128} />
                </Box>
                <IconCopy w={3} h={3} />
              </Flex>
            </Hover>
          </Flex>
        )}
        {/* value */}
        <Flex direction={"row"} align={"center"} justify={"center"} mt={2}>
          <Flex align={"center"}>
            <Box fontSize={24} fontWeight={600}>
              {showBalance ? (
                <TokenNum
                  amount={balance?.total}
                  decimals={nativeCurrency.decimals}
                  symbol={nativeCurrency.symbol}
                />
              ) : (
                "*****"
              )}
            </Box>
            <Box
              cursor={"pointer"}
              ml={1}
              onClick={() => dispatch.accountV2.changeBalanceState()}
            >
              {showBalance ? (
                <IconEyeOn w={4} h={4} />
              ) : (
                <IconEyeClose w={4} h={4} />
              )}
            </Box>
          </Flex>
          <RescanButton paused={!!sendingAleoTx} />
        </Flex>
        {/* Action Item */}
        <ActionPanel chainMode={chainMode} />
      </Box>
      {!!sendingAleoTx && (
        <Flex
          bgColor={"green.50"}
          p={2}
          borderRadius={"lg"}
          justify={"center"}
          align={"center"}
          mt={2}
          mx={6}
          onClick={() => {
            navigate(`/token_detail/${uniqueId}`);
          }}
        >
          <IconLoading
            w={4}
            h={4}
            mr={1}
            stroke={"green.600"}
            animation={`${rotateAnimation} infinite 2s linear`}
          />
          <Text color={"green.600"} fontSize={"smaller"}>
            {t("Send:sendingAleoTx")}
          </Text>
        </Flex>
      )}
    </>
  );
};
