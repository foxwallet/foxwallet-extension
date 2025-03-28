import { PageWithHeader } from "@/layouts/Page";
import {
  Flex,
  Text,
  VStack,
  chakra,
  useClipboard,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import WALLET_LOGO from "@/common/assets/image/logo.png";
import { Content } from "@/layouts/Content";
import {
  IconCopyBlack,
  IconTokenPlaceHolder,
  IconWarning,
} from "@/components/Custom/Icon";
import { useCallback, useMemo } from "react";
import { useCopyToast } from "@/components/Custom/CopyToast/useCopyToast";
import { useTranslation } from "react-i18next";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { useCoinService } from "@/hooks/useCoinService";
import { useSafeParams } from "@/hooks/useSafeParams";
import { useSafeTokenInfo } from "@/hooks/useSafeTokenInfo";

const QRCode = chakra(QRCodeSVG);

function ReceiveScreen() {
  const { t } = useTranslation();

  const { uniqueId, address } = useSafeParams();
  // console.log("      params ", uniqueId, address);

  const { chainConfig } = useCoinService(uniqueId);

  const { tokenInfo } = useSafeTokenInfo(uniqueId, address);
  // console.log("      tokenInfo");
  // console.log({ ...tokenInfo });

  const { onCopy } = useClipboard(address);
  const { showToast } = useCopyToast();

  const handleCopy = useCallback(() => {
    onCopy();
    showToast();
  }, [onCopy, showToast]);

  const { borderColor } = useThemeStyle();
  const iconBg = useColorModeValue("gray.50", "#777E90");

  return (
    <PageWithHeader enableBack title={t("Receive:title")}>
      <Content>
        <VStack>
          {tokenInfo.icon ? (
            <Image src={tokenInfo?.icon} w={10} h={10} borderRadius={20} />
          ) : (
            <IconTokenPlaceHolder w={10} h={10} />
          )}
          <Text fontWeight={500} fontSize={14}>
            {`${t("Receive:scanToTransfer")} ${tokenInfo.symbol}`}
          </Text>
          <Flex
            bg={"rgba(239, 70, 111, 0.08)"}
            px={2.5}
            py={1}
            borderRadius={4}
            align={"center"}
          >
            <IconWarning mr={1} />
            <Text color={"#EF466F"} fontWeight={500} fontSize={14}>
              {t("Receive:onlyTips", {
                symbol: chainConfig.chainName,
              })}
            </Text>
          </Flex>
        </VStack>
        <QRCode
          value={address ?? ""}
          mt={4}
          h={200}
          w={200}
          mx={"auto"}
          imageSettings={{
            src: WALLET_LOGO,
            height: 30,
            width: 30,
            excavate: false,
          }}
        />
        <Text alignSelf={"center"} mt={3} mb={2} fontWeight={500} fontSize={14}>
          {t("Receive:walletAddr")}
        </Text>
        <Flex
          align={"center"}
          justify={"space-between"}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius={8}
          p={2.5}
        >
          <Text noOfLines={3} maxW={274} fontSize={12} fontWeight={500}>
            {address ?? ""}
          </Text>
          <Flex
            h={6}
            w={6}
            bg={iconBg}
            justify={"center"}
            align={"center"}
            borderRadius={12}
            cursor={"pointer"}
            onClick={handleCopy}
          >
            <IconCopyBlack h={3.5} w={3.5} />
          </Flex>
        </Flex>
      </Content>
    </PageWithHeader>
  );
}

export default ReceiveScreen;
