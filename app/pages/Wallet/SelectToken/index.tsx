import {
  IconCheckCircle,
  IconCheckCircleBlack,
  IconCheckLine,
} from "@/components/Custom/Icon";
import { TokenItem, TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useAssetList } from "@/hooks/useAssetList";
import { useLocationParams } from "@/hooks/useLocationParams";
import { PageWithHeader } from "@/layouts/Page";
import { Flex } from "@chakra-ui/react";
import { Token } from "core/coins/ALEO/types/Token";
import { InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const SelectTokenScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId, address } = useParams();
  // const nextPage = new URLSearchParams(
  //   location.href.slice(location.href.indexOf("?") + 1),
  // ).get("page");
  const nextPage = useLocationParams("page");
  const currTokenStr = useLocationParams("currToken");
  const currToken: Token | undefined = currTokenStr
    ? JSON.parse(currTokenStr)
    : undefined;

  const { assets } = useAssetList(uniqueId as InnerChainUniqueId, address!);

  const onTokenClick = (token: Token) => {
    console.log(
      "===> url",
      `${nextPage}?token=${JSON.stringify(token)}`,
      " location ",
      JSON.stringify(location),
    );
    navigate(`/${nextPage}?token=${JSON.stringify(token)}`, {
      replace: true,
    });
  };

  return (
    <PageWithHeader
      title={t("SelectToken:title")}
      enableBack
      onBack={() => {
        navigate(`/${nextPage}?token=${currToken}`);
        return false;
      }}
    >
      <Flex maxH={"400px"} overflowY={"auto"} flexDir={"column"}>
        {assets.map((token) => {
          return (
            <Flex key={token.tokenId} align={"center"}>
              <TokenItemWithBalance
                token={token}
                onClick={onTokenClick}
                uniqueId={uniqueId as InnerChainUniqueId}
                address={address!}
                leftElement={
                  token.tokenId === currToken?.tokenId ? (
                    <IconCheckCircle w={4} h={4} mr={2} />
                  ) : (
                    <IconCheckCircleBlack w={4} h={4} mr={2} />
                  )
                }
              />
            </Flex>
          );
        })}
      </Flex>
    </PageWithHeader>
  );
};

export default SelectTokenScreen;
