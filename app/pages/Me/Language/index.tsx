import { actions } from "@/store/actions";
import { PageWithHeader } from "@/layouts/Page";
import { Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { Content } from "@/layouts/Content";
import { LanguageLabels, SupportLanguages } from "@/locales/i18";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { IconCheckLineBlack } from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useThemeStyle } from "@/hooks/useThemeStyle";
import { HIDE_SCROLL_BAR_CSS } from "@/common/constants/style";
import { isSidePanel } from "@/common/utils/walletUI";

function LanguageScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currLanguage = usePopupSelector((state) => state.setting.language);
  const dispatch = usePopupDispatch();
  const changeLanguage = useCallback(
    (newLanguage: SupportLanguages) => {
      void dispatch(actions.setting.changeLanguage({ language: newLanguage }));
      navigate(-1);
    },
    [dispatch, navigate],
  );

  const { borderColor } = useThemeStyle();

  return (
    <PageWithHeader fillSidePanel enableBack title={t("Language:title")}>
      <Content minH={0}>
        <Flex
          flexDir={"column"}
          flex={isSidePanel() ? 1 : undefined}
          minH={0}
          maxH={isSidePanel() ? undefined : 500}
          overflowY={"auto"}
          sx={HIDE_SCROLL_BAR_CSS}
        >
          {Object.values(SupportLanguages).map((language) => (
            <Flex
              key={language}
              onClick={() => {
                changeLanguage(language);
              }}
              justify={"space-between"}
              align={"center"}
              borderStyle={"solid"}
              borderWidth={"1px"}
              borderRadius={"lg"}
              borderColor={borderColor}
              p={3}
              mt={2}
              as={"button"}
            >
              <Text fontWeight={500}>{LanguageLabels[language]}</Text>
              {currLanguage === language && <IconCheckLineBlack w={5} h={5} />}
            </Flex>
          ))}
        </Flex>
      </Content>
    </PageWithHeader>
  );
}

export default LanguageScreen;
