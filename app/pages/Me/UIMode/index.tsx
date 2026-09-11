import { actions } from "@/store/actions";
import { PageWithHeader } from "@/layouts/Page";
import { Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { Content } from "@/layouts/Content";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { IconCheckLineBlack } from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { WalletUIMode } from "@/store/setting";
import { closeWalletUI } from "@/common/utils/walletUI";

function UIModeScreen() {
  const { t } = useTranslation();
  const currentMode = usePopupSelector(
    (state) => state.setting.uiMode ?? WalletUIMode.SidePanel,
  );
  const dispatch = usePopupDispatch();
  const changeMode = useCallback(
    (uiMode: WalletUIMode) => {
      void dispatch(actions.setting.updateUIMode({ uiMode }));
      void closeWalletUI().catch((error) => {
        console.error("Could not close wallet UI", error);
      });
    },
    [dispatch],
  );

  const modes = [
    { value: WalletUIMode.SidePanel, label: t("Setting:sidePanel") },
    { value: WalletUIMode.Popup, label: t("Setting:popup") },
  ];

  return (
    <PageWithHeader enableBack title={t("Setting:uiMode")}>
      <Content>
        <Flex flexDir={"column"}>
          {modes.map((mode) => (
            <Flex
              key={mode.value}
              onClick={() => {
                changeMode(mode.value);
              }}
              justify={"space-between"}
              align={"center"}
              borderStyle={"solid"}
              borderWidth={"1px"}
              borderRadius={"lg"}
              borderColor={"gray.50"}
              p={3}
              mt={2}
              as={"button"}
            >
              <Text fontWeight={500}>{mode.label}</Text>
              {currentMode === mode.value && <IconCheckLineBlack w={5} h={5} />}
            </Flex>
          ))}
        </Flex>
      </Content>
    </PageWithHeader>
  );
}

export default UIModeScreen;
