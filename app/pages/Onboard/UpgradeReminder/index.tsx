import {
  IconUpgradeReminder,
  IconUpgradeReminderDark,
} from "@/components/Custom/Icon";
import { Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import Browser from "webextension-polyfill";

const UpgradeReminderScreen = () => {
  const { t } = useTranslation();

  const ReminderLogo = useColorModeValue(
    <IconUpgradeReminder />,
    <IconUpgradeReminderDark />,
  );

  return (
    <Flex flex={1} direction={"column"} align={"center"} pt={20}>
      {ReminderLogo}
      <Text maxW={320} align={"center"} mt={5}>
        {t("Onboard:Upgrade:reminderTips")}
      </Text>
      <Button
        position={"absolute"}
        bottom={5}
        left={5}
        right={5}
        onClick={async () =>
          Browser.tabs.create({ url: "chrome://settings/help" })
        }
      >
        {t("Onboard:Upgrade:upgradeBtn")}
      </Button>
    </Flex>
  );
};

export default UpgradeReminderScreen;
