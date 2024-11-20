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
  Spinner,
  Text,
  keyframes,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import { TokenNum } from "../TokenNum";
import { useCoinService } from "@/hooks/useCoinService";
import { useBalance } from "@/hooks/useBalance";
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
import { SupportLanguages, getCurrLanguage } from "@/locales/i18";
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

const rotateAnimation = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

export const AccountInfoHeader = () => {
  const navigate = useNavigate();
  const { groupAccount, getMatchAccountsWithUniqueId } = useGroupAccount();
  const { chainMode, availableChainUniqueIds } = useChainMode();

  // TODO: 根据 chainMode 获取  asset
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(availableChainUniqueIds[0])[0];
  }, []);
  const uniqueId = availableChainUniqueIds[0];
  const { nativeCurrency, chainConfig, coinService } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance({
    uniqueId,
    programId: NATIVE_TOKEN_PROGRAM_ID,
    address: selectedAccount.account.address,
    refreshInterval: 4000,
  });
  const { selectedWallet } = useCurrWallet();
  const { popupServerClient } = useClient();
  const { t } = useTranslation();
  const showBalance = usePopupSelector((state) => state.accountV2.showBalance);
  const dispatch = usePopupDispatch();
  const { showToast } = useCopyToast();
  const { onCopy } = useClipboard(selectedAccount.account.address);
  const { sendingAleoTx } = useIsSendingAleoTx(uniqueId);
  const { lock } = useAuth();
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const { faucetStatus, getFaucetStatus } = useFaucetStatus(
    uniqueId,
    selectedAccount,
  );
  useTxsNotification(uniqueId, selectedAccount.account.address, 5000);
  const onPressFaucet = useCallback(async () => {
    if (requestingFaucet) return;
    setRequestingFaucet(true);
    try {
      if (chainConfig.innerFaucet) {
        const status = await getFaucetStatus();
        switch (status?.status) {
          case FaucetStatus.UNREADY: {
            if (chainConfig.faucetApi) {
              void Browser.tabs.create({ url: chainConfig.faucetApi });
            }
            break;
          }
          case FaucetStatus.EMPTY: {
            const address = selectedAccount.account.address;
            const coinType = chainUniqueIdToCoinType(uniqueId);
            const { rawMessage, displayMessage } = await (
              coinService as AleoService
            ).faucetMessage(address);
            const { confirmed } = await showSignMessageDialog({
              address,
              message: displayMessage,
            });
            if (confirmed) {
              const signature = await popupServerClient.signMessage({
                walletId: selectedAccount.wallet.walletId,
                accountId: selectedAccount.account.accountId,
                coinType,
                message: stringToHex(rawMessage),
              });
              const res = await (coinService as AleoService).requestFaucet({
                address,
                message: rawMessage,
                signature,
              });
              if (!res) {
                throw new Error("Request faucet failed");
              }
              await getFaucetStatus();
            }
            break;
          }
          case FaucetStatus.PENDING: {
            break;
          }
          case FaucetStatus.DONE: {
            const { confirmed } = await showFaucetClaimedDialog({
              content: status.txId ? t("Faucet:claimed") : t("Faucet:wait"),
              onChain: !!status.txId,
            });
            if (confirmed && status.txId) {
              const lang =
                getCurrLanguage() === SupportLanguages.ZH
                  ? ExplorerLanguages.ZH
                  : ExplorerLanguages.EN;
              const url = (coinService as AleoService).getTxDetailUrl(
                status.txId,
                lang,
              );
              if (url) {
                void Browser.tabs.create({ url });
              }
            }
            break;
          }
        }
        // if (status?.status === FaucetStatus.DONE) {
        //   const { confirmed } = await showFaucetClaimedDialog({
        //     content: status.txId ? t("Faucet:claimed") : t("Faucet:wait"),
        //     onChain: !!status.txId,
        //   });
        //   if (confirmed && status.txId) {
        //     const lang =
        //       getCurrLanguage() === SupportLanguages.ZH
        //         ? ExplorerLanguages.ZH
        //         : ExplorerLanguages.EN;
        //     const url = coinService.getTxDetailUrl(status.txId, lang);
        //     if (url) {
        //       Browser.tabs.create({ url });
        //     }
        //   }
        //   return;
        // }
        // const address = selectedAccount.address;
        // const coinType = chainUniqueIdToCoinType(uniqueId);
        // const { rawMessage, displayMessage } =
        //   await coinService.faucetMessage(address);
        // const { confirmed } = await showSignMessageDialog({
        //   address: address,
        //   message: displayMessage,
        // });
        // if (confirmed) {
        //   const signature = await popupServerClient.signMessage({
        //     walletId: selectedAccount.walletId,
        //     accountId: selectedAccount.accountId,
        //     coinType,
        //     message: stringToHex(rawMessage),
        //   });
        //   const res = await coinService.requestFaucet({
        //     address,
        //     message: rawMessage,
        //     signature,
        //   });
        //   if (!res) {
        //     throw new Error("Request faucet failed");
        //   }
        //   await getFaucetStatus();
        // }
      } else if (chainConfig.faucetApi) {
        void Browser.tabs.create({ url: chainConfig.faucetApi });
      }
    } catch (err) {
      void showErrorToast({ message: (err as Error).message });
    } finally {
      setRequestingFaucet(false);
    }
  }, [
    chainConfig,
    getFaucetStatus,
    coinService,
    popupServerClient,
    selectedAccount,
    requestingFaucet,
    t,
  ]);

  const options: ActionButtonProps[] = useMemo(() => {
    const initOptions: ActionButtonProps[] = [
      {
        title: t("Receive:title"),
        icon: <IconReceive w={9} h={9} />,
        onPress: () => {
          navigate("/receive");
        },
      },
      {
        title: t("Send:title"),
        icon: <IconSend w={9} h={9} />,
        disabled: sendingAleoTx ?? balance === undefined,
        onPress: () => {
          navigate("/send_aleo");
        },
      },
      {
        title: t("JoinSplit:title"),
        icon: <IconJoinSplit w={9} h={9} />,
        disabled: sendingAleoTx ?? balance === undefined,
        onPress: async () => {
          const { confirmed, data } = await showSelectJoinSplitDialog();
          if (confirmed && data) {
            if (data === SelectJoinSplitOption.SPLIT) {
              navigate("/split");
            } else {
              navigate("/join");
            }
          }
        },
      },
    ];
    if (chainConfig.testnet) {
      return initOptions.concat({
        title: t("Faucet:title"),
        icon: <IconFaucet w={9} h={9} />,
        onPress: onPressFaucet,
        isLoading:
          requestingFaucet || faucetStatus?.status === FaucetStatus.PENDING,
      });
    }
    return initOptions;
  }, [
    navigate,
    t,
    sendingAleoTx,
    balance,
    chainConfig,
    requestingFaucet,
    faucetStatus,
  ]);

  const onChangeWallet = useCallback(() => {
    void showWalletsDrawer({
      onManageWallet: () => {
        navigate("/manage_wallet");
      },
    });
  }, [showWalletsDrawer, navigate]);

  const onCopyAddress = useCallback(() => {
    onCopy();
    showToast();
  }, [showToast, onCopy]);

  const renderActionItem = useCallback(
    (item: ActionButtonProps, index: number) => {
      return (
        <ActionButton key={`${item.title}${index}`} {...item} maxW={"20%"} />
      );
    },
    [],
  );

  const bgGradient = useColorModeValue(
    "linear(to-br, #ECFFF2, #FFFFFF, #ECFFF2)",
    "linear(to-br, #14321A, #000000, #14321A)",
  );
  const { borderColor, selectedBorderColor } = useThemeStyle();

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
        <Flex justify={"space-between"} align={"center"}>
          <Flex
            cursor={"pointer"}
            onClick={onChangeWallet}
            direction={"row"}
            align={"center"}
          >
            <IconLogo w={8} h={8} mr={1} />
            <Flex direction={"column"} align={"flex-start"}>
              <Text fontSize={12} lineHeight={4} fontWeight={500}>
                {selectedWallet?.walletName}
              </Text>
              <Text fontSize={10} color={"#777E90"} fontWeight={500}>
                {selectedAccount.account.accountName}
              </Text>
            </Flex>
            <IconArrowRight w={18} h={18} />
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
        </Flex>
        <Flex mt={6} direction={"row"} align={"center"}>
          <Box maxW={128} noOfLines={1} fontSize={11} color={"#777E90"}>
            <MiddleEllipsisText
              text={selectedAccount.account.address}
              width={128}
            />
          </Box>
          <Hover onClick={onCopyAddress}>
            <IconCopy w={3} h={3} />
          </Hover>
        </Flex>
        <Flex
          direction={"row"}
          align={"center"}
          justify={"space-between"}
          mt={2}
        >
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
        <Flex direction={"row"} justify={"space-around"} mt={6}>
          {options.map(renderActionItem)}
        </Flex>
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

interface ActionButtonProps {
  title: string;
  icon: any;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void | Promise<void>;
}
const ActionButton = ({
  title,
  icon,
  isLoading = false,
  disabled = false,
  onPress,
  ...rest
}: ActionButtonProps & FlexProps) => {
  const unableToClick = disabled || isLoading;
  return (
    <Flex
      cursor={unableToClick ? "not-allowed" : "pointer"}
      onClick={!unableToClick ? onPress : undefined}
      align={"center"}
      direction={"column"}
      {...rest}
      position={"relative"}
    >
      {unableToClick && (
        <Box
          position={"absolute"}
          w={"100%"}
          h={"100%"}
          bgColor={"rgb(255, 255, 255, 0.5)"}
          zIndex={1}
          borderRadius={"lg"}
        ></Box>
      )}
      {isLoading ? (
        <Flex
          justify={"center"}
          align={"center"}
          bgColor={"black"}
          w={9}
          h={9}
          borderRadius={18}
        >
          <Spinner w={5} h={5} color={"green.500"} />
        </Flex>
      ) : (
        icon
      )}
      <Text mt={1} fontSize={12} fontWeight={500} color={"black"}>
        {title}
      </Text>
    </Flex>
  );
};
