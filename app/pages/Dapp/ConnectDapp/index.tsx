import { ERROR_CODE } from "@/common/types/error";
import { IconFoxWallet, IconLogo } from "@/components/Custom/Icon";
import { useClient } from "@/hooks/useClient";
import { useDappRequest } from "@/hooks/useDappRequest";
import { Content } from "@/layouts/Content";
import { Button, Flex, Text, keyframes } from "@chakra-ui/react";
import BaseCheckbox from "../../../components/Custom/Checkbox";

import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { AccountInfo } from "@/components/Dapp/AccountInfo";
import { useTranslation } from "react-i18next";
import { DecryptPermission } from "@/database/types/dapp";
import { useGroupAccount } from "@/hooks/useGroupAccount";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";

const shakeAnimation = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;

function ConnectAleoDappScreen() {
  const navigate = useNavigate();
  const { getMatchAccountsWithUniqueId } = useGroupAccount();
  const selectedAccount = useMemo(() => {
    return getMatchAccountsWithUniqueId(InnerChainUniqueId.ALEO_MAINNET)[0];
  }, []);

  const { requestId } = useParams();
  const { popupServerClient } = useClient();
  const { dappRequest, loading } = useDappRequest(requestId);
  const [showShakeAnimation, setShowShakeAnimation] = useState(false);
  const needCheck = useMemo(() => {
    return (
      dappRequest?.payload?.decryptPermission ===
      DecryptPermission.OnChainHistory
    );
  }, [dappRequest]);
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation();

  const permissionExplain = useMemo(() => {
    return {
      [DecryptPermission.NoDecrypt]: t("Dapp:noDecrypt"),
      [DecryptPermission.UponRequest]: t("Dapp:uponRequest"),
      [DecryptPermission.AutoDecrypt]: t("Dapp:autoDecrypt"),
      [DecryptPermission.OnChainHistory]: t("Dapp:onChainHistory"),
    };
  }, [t]);

  const dappRequestInfo = useMemo(() => {
    if (!dappRequest) {
      return null;
    }
    const { payload } = dappRequest;
    const { decryptPermission, network, programs } = payload;

    return (
      <Flex
        direction={"column"}
        alignSelf={"stretch"}
        justify={"space-between"}
        borderRadius={"lg"}
        borderStyle={"solid"}
        borderWidth={"1px"}
        borderColor={"gray.50"}
        flex={1}
        maxH={200}
        overflowY={"auto"}
        p={3}
      >
        <Flex justify={"space-between"}>
          <Text>{t("Dapp:network")}</Text>
          <Text fontWeight={"bold"}>{network}</Text>
        </Flex>
        <Flex justify={"space-between"} mt={2}>
          <Text>{t("Dapp:permission")}</Text>
          <Text fontWeight={"bold"} maxW={210} wordBreak={"break-all"}>
            {permissionExplain[decryptPermission as DecryptPermission] ?? ""}
          </Text>
        </Flex>
        <Flex justify={"space-between"} mt={2}>
          <Text>{t("Dapp:programs")}</Text>
          <Text fontWeight={"bold"} maxW={210} wordBreak={"break-all"}>
            {(programs ?? []).join(",\n")}
          </Text>
        </Flex>
      </Flex>
    );
  }, [dappRequest, t]);

  const onConnect = useCallback(() => {
    if (needCheck && !checked) {
      setShowShakeAnimation(true);
      setTimeout(() => {
        setShowShakeAnimation(false);
      }, 820);
      return;
    }
    if (requestId && selectedAccount?.account.address) {
      popupServerClient.onRequestFinish({
        requestId,
        data: selectedAccount.account.address,
      });
    }
  }, [
    popupServerClient,
    requestId,
    selectedAccount?.account.address,
    needCheck,
    checked,
  ]);

  const onCancel = useCallback(() => {
    if (requestId) {
      popupServerClient.onRequestFinish({
        requestId,
        error: ERROR_CODE.USER_CANCEL,
      });
    }
  }, []);

  return (
    <Content>
      <ResponsiveFlex
        alignSelf={"center"}
        align={"center"}
        flexDir={"column"}
        flex={1}
      >
        <Flex
          justify={"center"}
          align={"center"}
          mb={3}
          alignSelf={"flex-start"}
        >
          <IconLogo mr={2} />
          <IconFoxWallet />
        </Flex>
        {!!dappRequest?.siteInfo && (
          <DappInfo siteInfo={dappRequest.siteInfo} />
        )}
        <Text mt={3} mb={3}>
          {t("Dapp:requestConnect")}
        </Text>
        <AccountInfo account={selectedAccount} />
        <Text mt={3} mb={3}>
          {t("Dapp:requestDetail")}
        </Text>
        {dappRequestInfo}
        <Flex
          mt={3}
          position={"fixed"}
          left={5}
          right={5}
          bottom={5}
          justify={"center"}
        >
          <ResponsiveFlex flexDir={"column"}>
            {needCheck && (
              <Flex mb={3}>
                <BaseCheckbox
                  onStatusChange={(status) => {
                    setChecked(status);
                  }}
                  container={{
                    animation: showShakeAnimation
                      ? `${shakeAnimation} 0.82s cubic-bezier(.36,.07,.19,.97) both`
                      : "none",
                  }}
                >
                  <Text fontSize={"12"} wordBreak={"break-all"}>
                    {t("Dapp:permissionTip")}
                  </Text>
                </BaseCheckbox>
              </Flex>
            )}
            <Flex alignSelf={"stretch"}>
              <Button
                onClick={onCancel}
                flex={1}
                colorScheme="secondary"
                mr={2}
              >
                {t("Common:cancel")}
              </Button>
              <Button onClick={onConnect} flex={1} ml={"2"}>
                {t("Common:confirm")}
              </Button>
            </Flex>
          </ResponsiveFlex>
        </Flex>
      </ResponsiveFlex>
    </Content>
  );
}

export default ConnectAleoDappScreen;
