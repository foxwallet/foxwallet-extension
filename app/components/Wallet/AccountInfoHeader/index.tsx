import {
  IconArrowRight,
  IconCopy,
  IconEyeClose,
  IconEyeOn,
  IconLoading,
  IconLock,
  IconLogo,
} from "@/components/Custom/Icon";
import {
  Box,
  Flex,
  Image,
  keyframes,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import type React from "react";
import { useCallback, useMemo } from "react";
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
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useChainMode } from "@/hooks/useChainMode";
import {
  ChainAssembleMode,
  type ChainDisplayMode,
} from "core/types/ChainUniqueId";
import { showChangeNetworkDrawer } from "@/components/Wallet/ChangeNetworkDrawer";
import { ActionPanel } from "@/components/Wallet/ActionPanel";
import { HeaderMiddleView } from "@/components/Wallet/HeaderMiddleView";
import { showCopyAddressDrawer } from "@/components/Wallet/CopyAddressDrawer";
import { useBalance } from "@/hooks/useBalance";

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();
  const {
    chainMode,
    chainModeName,
    availableChainUniqueIds,
    availableChains,
    availableAccounts,
  } = useChainMode();

  const isAllMode = useMemo(() => {
    return chainMode.mode === ChainAssembleMode.ALL;
  }, [chainMode.mode]);

  const uniqueId = availableChainUniqueIds[0];
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);

  const { selectedWallet } = useCurrWallet();
  const { t } = useTranslation();
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);
  const dispatch = usePopupDispatch();
  const { showToast } = useCopyToast();

  // debugger;

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

  const copyAddress = useCallback(async () => {
    if (isAllMode) {
      await showCopyAddressDrawer();
    } else {
      try {
        if (availableAccounts.length === 0) {
          throw new Error("Can't match account " + chainMode.mode);
        }
        if (availableChains.length === 0) {
          throw new Error(
            "Can't match uniqueId " +
              chainMode.mode +
              (chainMode.mode === ChainAssembleMode.SINGLE &&
                chainMode.uniqueId),
          );
        }
        if (availableAccounts.length === 1 && availableChains.length === 1) {
          await navigator.clipboard.writeText(
            availableAccounts[0].account.address,
          );
          showToast();
        }
      } catch (err) {
        console.log("copyAddress err ", err);
      }
    }
  }, [availableAccounts, availableChains, chainMode, isAllMode, showToast]);

  const { balance } = useBalance({
    uniqueId,
    address: availableAccounts[0].account.address,
  });

  const bgGradient = useColorModeValue(
    "linear(to-br, #ECFFF2, #FFFFFF, #ECFFF2)",
    "linear(to-br, #14321A, #000000, #14321A)",
  );
  const { borderColor, selectedBorderColor } = useThemeStyle();

  const changeNetwork = useCallback(async () => {
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
            onClick={changeNetwork}
          >
            {isAllMode ? (
              <IconLogo w={5} h={5} />
            ) : (
              <Image
                src={availableChains[0].logo}
                w={5}
                h={5}
                borderRadius={10}
              />
            )}
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
          {/* account */}
          <HeaderMiddleView
            onClick={onChangeWallet}
            title={groupAccount.group.groupName}
            showArrow={false}
            showCopy={isAllMode}
            onCopy={copyAddress}
          />
        </Flex>
        {/* copy address */}
        {!isAllMode && (
          <Flex
            mt={2}
            direction={"row"}
            align={"center"}
            justifyContent={"center"}
          >
            <Hover onClick={copyAddress} bg={"#f9f9f9"} borderRadius={"5px"}>
              <Flex dir={"row"} align={"center"} justify={"center"} marginX={1}>
                <Box maxW={128} noOfLines={1} fontSize={11} color={"#777E90"}>
                  <MiddleEllipsisText text={copyAddressHint} width={128} />
                </Box>
                <IconCopy w={3} h={3} ml={1} />
              </Flex>
            </Hover>
          </Flex>
        )}
        {/* value */}
        {!isAllMode && (
          <Flex direction={"row"} align={"center"} justify={"center"} mt={2}>
            <Flex align={"center"}>
              <Box fontSize={24} fontWeight={600}>
                {showBalance ? (
                  <TokenNum
                    amount={balance?.total ?? 0n}
                    decimals={nativeCurrency.decimals}
                    symbol={nativeCurrency.symbol}
                  />
                ) : (
                  "*****"
                )}
              </Box>
              <Box
                cursor={"pointer"}
                ml={2}
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
        )}

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
