import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { H6 } from "@/common/theme/components/text";
import { Button, Flex, Image, Text, Textarea } from "@chakra-ui/react";
import { Content } from "@/layouts/Content";
import { WarningArea } from "../../Custom/WarningArea";
import { useTranslation } from "react-i18next";
import { useCoinService } from "@/hooks/useCoinService";
import { DEFAULT_CHAIN_UNIQUE_ID } from "core/constants/chain";
import { CoinType } from "core/types";
import { useAllChainList } from "@/hooks/useChainList";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { IconChevronRight } from "@/components/Custom/Icon";
import { useNavigate } from "react-router-dom";

type Props = {
  onConfirm: (privateKey: string, coinType: CoinType) => void;
};

export const ImportPrivateKeyStep = ({ onConfirm }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currCoinType, setCurrCoinType] = useState<CoinType>(CoinType.ALEO);
  const allChains = useAllChainList();
  const { chainConfig: aleoConfig } = useCoinService(
    InnerChainUniqueId.ALEO_MAINNET, // use mainnet as default
  );
  const [privateKey, setPrivateKey] = useState("");

  const currChain = useMemo(() => {
    const uniqueId = DEFAULT_CHAIN_UNIQUE_ID[currCoinType];
    return allChains.find((item) => uniqueId === item.uniqueId) ?? aleoConfig;
  }, [aleoConfig, allChains, currCoinType]);

  // const privateKeyValid2 = useMemo(() => {
  //   return coinBasic.isValidPrivateKey(privateKey, AleoImportPKType.ALEO_PK);
  // }, [coinBasic, privateKey]);
  const privateKeyValid = true; // todo

  useEffect(() => {
    const newCoinType = sessionStorage.getItem("chooseNewCoinType");
    if (newCoinType) {
      setCurrCoinType(newCoinType as CoinType);
    }
    sessionStorage.removeItem("chooseNewCoinType");
  }, []);

  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value || "";
    value = value.trim();
    setPrivateKey(value);
  }, []);

  const showError = useMemo(() => {
    if (!privateKey) {
      return false;
    }
    return !privateKeyValid;
  }, [privateKey, privateKeyValid]);

  const onChangeCoinType = useCallback(() => {
    navigate(`/change_coin_type/${currCoinType}`);
  }, [currCoinType, navigate]);

  return (
    <Content>
      <H6 mb="2">{t("PrivateKey:coinType")}</H6>
      <Flex
        flexDir={"row"}
        borderStyle={"solid"}
        borderColor={"gray.100"}
        borderWidth={"1.5px"}
        borderRadius={"lg"}
        px={4}
        mt={2}
        onClick={onChangeCoinType}
        justify={"space-between"}
        align={"center"}
        h={"48px"}
        cursor={"pointer"}
      >
        <Flex align={"center"}>
          <Image
            src={currChain.logo}
            w={"24px"}
            h={"24px"}
            borderRadius={"50px"}
          />
          <Text ml={2}>{currChain.nativeCurrency.symbol}</Text>
        </Flex>
        <IconChevronRight w={4} h={4} mr={-1} />
      </Flex>
      <H6 mb="2" mt={4}>
        {t("PrivateKey:title")}
      </H6>
      <Textarea
        autoComplete="off"
        value={privateKey}
        onChange={onInputChange}
        placeholder={t("PrivateKey:enterPlaceholder")}
        size="md"
        resize={"none"}
        h={"150"}
        borderColor={showError ? "red.500" : "gray.100"}
      />
      {showError && (
        <WarningArea container={{ mt: "2" }} content={"Wrong private key."} />
      )}
      <Button
        isDisabled={!privateKey}
        position={"fixed"}
        bottom={10}
        left={"4"}
        right={"4"}
        onClick={() => {
          const data = privateKey.trim();
          setPrivateKey("");
          onConfirm(data, currCoinType);
        }}
      >
        {t("Common:confirm")}
      </Button>
    </Content>
  );
};
