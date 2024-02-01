import { IconChevronRight, IconFoxWallet } from "@/components/Custom/Icon";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import {
  Flex,
  Text,
  Image,
  Divider,
  Box,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
// @ts-ignore
import WALLET_LOGO from "@/common/assets/image/logo.png";
import browser from "webextension-polyfill";
import {
  EXTENSION_PAGE_URL,
  EXTENSION_STORE_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from "@/common/constants";
import { useMemo } from "react";

const AboutScreen = () => {
  const { t } = useTranslation();
  const version = useMemo(() => {
    return browser.runtime.getManifest().version;
  }, []);
  const noUpdate = true;

  return (
    <PageWithHeader title={t("About:title")}>
      <Content>
        <Flex align={"center"} flexDir={"column"} mt={4}>
          <Image src={WALLET_LOGO} w={"60px"} h={"60px"} />
          <IconFoxWallet w={120} h={20} mt={-3} fill={"white"} />
        </Flex>
        <Divider h={"1px"} />
        <Flex
          py={2.5}
          mb={2.5}
          align={"center"}
          justify={"space-between"}
          cursor={"pointer"}
          onClick={() =>
            browser.tabs.create({
              url: `${EXTENSION_PAGE_URL}${browser.runtime.id}`,
            })
          }
        >
          <Text fontSize={13}>{t("About:version")}</Text>
          <Text textDecoration={"underline"}>v{version}</Text>
        </Flex>
        {/* <Flex py={2.5} mb={2.5} align={"center"} justify={"space-between"}>
          <Text fontSize={13}>{t("About:upgrade")}</Text>
          {noUpdate ? (
            <Text color={"#777E90"} fontSize={12}>
              {t("About:noUpdate")}
            </Text>
          ) : (
            <Flex align={"center"} as={"button"} onClick={() => {}}>
              <Text color={"#00D856"} fontSize={12}>
                {t("About:download")}
              </Text>
              <IconChevronRight w={4} h={4} />
            </Flex>
          )}
        </Flex> */}
      </Content>
      <VStack mb={8}>
        <Text
          cursor={"pointer"}
          mb={6}
          color={"green.600"}
          fontSize={14}
          fontWeight={500}
          textDecoration={"underline"}
          onClick={() => browser.tabs.create({ url: EXTENSION_STORE_URL })}
        >
          {t("About:update")}
        </Text>
        <Box
          color={"green.600"}
          fontSize={14}
          fontWeight={500}
          cursor={"pointer"}
          onClick={() => browser.tabs.create({ url: PRIVACY_POLICY_URL })}
        >
          <Text>{t("About:privacyPolicy")}</Text>
        </Box>
        <Box
          color={"green.600"}
          fontSize={14}
          fontWeight={500}
          cursor={"pointer"}
          onClick={() => browser.tabs.create({ url: TERMS_OF_SERVICE_URL })}
        >
          <Text>{t("About:userAgreement")}</Text>
        </Box>
      </VStack>
    </PageWithHeader>
  );
};

export default AboutScreen;
