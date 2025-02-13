import {
  ChainAssembleMode,
  type ChainDisplayMode,
  type ChainUniqueId,
  InnerChainUniqueId,
} from "core/types/ChainUniqueId";
import { Box, Flex, type FlexProps, Spinner, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { IconJoinSplit, IconReceive, IconSend } from "@/components/Custom/Icon";
import {
  SelectJoinSplitOption,
  showSelectJoinSplitDialog,
} from "@/components/Send/SelectJoinSplit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useIsSendingAleoTx } from "@/hooks/useSendingTxStatus";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { useBalance } from "@/hooks/useBalance";
import { useCoinService } from "@/hooks/useCoinService";
import { useFaucetActionOption } from "@/hooks/useFaucetActionOption";

export interface ActionButtonProps {
  title: string;
  icon: any;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void | Promise<void>;
}
export const ActionButton = ({
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

type IProps = {
  chainMode: ChainDisplayMode;
};

const MultiChainActionPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const options: ActionButtonProps[] = useMemo(() => {
    const initOptions: ActionButtonProps[] = [
      {
        title: t("Receive:title"),
        icon: <IconReceive w={9} h={9} />,
        onPress: () => {
          navigate("/select_network/receive");
        },
      },
      {
        title: t("Send:title"),
        icon: <IconSend w={9} h={9} />,
        disabled: false,
        onPress: () => {
          navigate("/select_group_token/send");
        },
      },
    ];
    return initOptions;
  }, [t, navigate]);
  return (
    <Flex direction={"row"} justify={"space-around"} mt={2}>
      {options.map((item, index) => {
        return (
          <ActionButton key={`${item.title}${index}`} {...item} maxW={"20%"} />
        );
      })}
    </Flex>
  );
};

const SingleChainActionPanel = ({ uniqueId }: { uniqueId: ChainUniqueId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendingAleoTx } = useIsSendingAleoTx();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const { chainConfig } = useCoinService(uniqueId);
  const option = useFaucetActionOption(uniqueId);

  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(uniqueId)[0];
  }, [getMatchAccountsWithUniqueId, uniqueId]);

  const { balance, loadingBalance } = useBalance({
    uniqueId,
    address: selectedAccount.account.address,
    refreshInterval: 4000,
  });

  const buttonDisabled = useMemo(() => {
    if (uniqueId !== InnerChainUniqueId.ALEO_MAINNET) {
      return false;
    } else {
      return sendingAleoTx ?? balance === undefined;
    }
  }, [balance, sendingAleoTx, uniqueId]);

  const options: ActionButtonProps[] = useMemo(() => {
    const initOptions: ActionButtonProps[] = [
      {
        title: t("Receive:title"),
        icon: <IconReceive w={9} h={9} />,
        onPress: () => {
          // todo
          navigate(`/select_token_v2/${uniqueId}/receive`);
        },
      },
      {
        title: t("Send:title"),
        icon: <IconSend w={9} h={9} />,
        disabled: buttonDisabled,
        onPress: () => {
          navigate(`/select_token_v2/${uniqueId}/send`);
        },
      },
    ];
    if (uniqueId === InnerChainUniqueId.ALEO_MAINNET) {
      initOptions.push({
        title: t("JoinSplit:title"),
        icon: <IconJoinSplit w={9} h={9} />,
        disabled: buttonDisabled,
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
      });
    }
    // todo
    if (chainConfig.testnet) {
      return initOptions.concat(option);
    }
    return initOptions;
  }, [t, buttonDisabled, uniqueId, chainConfig.testnet, navigate, option]);

  return (
    <Flex direction={"row"} justify={"space-around"} mt={2}>
      {options.map((item, index) => {
        return (
          <ActionButton key={`${item.title}${index}`} {...item} maxW={"20%"} />
        );
      })}
    </Flex>
  );
};

export const ActionPanel = ({ chainMode }: IProps) => {
  if (chainMode.mode === ChainAssembleMode.ALL) {
    return <MultiChainActionPanel />;
  }
  return <SingleChainActionPanel uniqueId={chainMode.uniqueId} />;
};
