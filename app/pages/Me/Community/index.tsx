import {
  IconChevronRight,
  IconDiscord,
  IconMedium,
  IconTelegram,
  IconTwitter,
  IconWallet,
  IconYoutube,
} from "@/components/Custom/Icon";
import { Content } from "@/layouts/Content";
import { PageWithHeader } from "@/layouts/Page";
import { Flex, Text } from "@chakra-ui/react";
import i18next from "i18next";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Browser from "webextension-polyfill";

interface Community {
  title: string;
  icon: React.ReactNode;
  url: string;
}

const CommunityList: Community[] = [
  {
    title: "Telegram",
    icon: <IconTelegram h={4} w={4} />,
    url:
      i18next.resolvedLanguage === "zh"
        ? "https://t.me/FoxWallet_CN"
        : "https://t.me/FoxWallet_EN",
  },
  {
    title: "Medium",
    icon: <IconMedium h={4} w={4} />,
    url: "https://medium.com/@FoxWallet",
  },
  {
    title: "Twitter",
    icon: <IconTwitter h={"12px"} w={"12px"} />,
    url: "https://twitter.com/FoxWallet",
  },
  {
    title: "Discord",
    icon: <IconDiscord h={4} w={4} />,
    url: "https://discord.com/invite/foxwallet",
  },
  {
    title: "Youtube",
    icon: <IconYoutube h={4} w={4} />,
    url: "https://www.youtube.com/@FoxWalletOfficial",
  },
];

const CommunityScreen = () => {
  const { t } = useTranslation();

  const renderCommunityItem = useCallback((item: Community, index: number) => {
    return (
      <Flex
        key={`${item.title}${index}`}
        align={"center"}
        justify={"space-between"}
        py={2.5}
        mb={2.5}
        as={"button"}
        onClick={() => Browser.tabs.create({ url: item.url })}
      >
        <Flex align={"center"}>
          {item.icon}
          <Text ml={2.5} fontSize={12} fontWeight={500}>
            {item.title}
          </Text>
        </Flex>
        <IconChevronRight h={4} w={4} />
      </Flex>
    );
  }, []);

  return (
    <PageWithHeader title={t("Setting:community")}>
      <Content>{CommunityList.map(renderCommunityItem)}</Content>
    </PageWithHeader>
  );
};

export default CommunityScreen;
