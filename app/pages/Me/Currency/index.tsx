import { PageWithHeader } from "@/layouts/Page";
import { Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { Content } from "@/layouts/Content";
import { LanguageLabels, SupportLanguages } from "@/locales/i18";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { IconCheckLineBlack } from "@/components/Custom/Icon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CURRENCY, SupportCurrency } from "core/constants/currency";

function CurrencyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currCurrency = usePopupSelector((state) => state.setting.currency);
  const dispatch = usePopupDispatch();
  const changeCurrency = useCallback(
    (newCurrency: SupportCurrency) => {
      dispatch.setting.updateCurrency({ currency: newCurrency });
      navigate(-1);
    },
    [dispatch.setting, navigate],
  );

  return (
    <PageWithHeader enableBack title={t("Currency:title")}>
      <Content>
        <Flex flexDir={"column"} maxH={500} overflowY={"auto"}>
          {Object.values(SupportCurrency).map((currency) => (
            <Flex
              key={currency}
              onClick={() => changeCurrency(currency)}
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
              <Text fontWeight={500}>{CURRENCY[currency].symbol}</Text>
              {currCurrency === currency && <IconCheckLineBlack w={5} h={5} />}
            </Flex>
          ))}
        </Flex>
      </Content>
    </PageWithHeader>
  );
}

export default CurrencyScreen;
