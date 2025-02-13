import { serializeToken } from "@/common/utils/string";
import {
  IconCheckCircle,
  IconCheckCircleBlack,
  IconSearch,
} from "@/components/Custom/Icon";
import { TokenItemWithBalance } from "@/components/Wallet/TokenItem";
import { useAssetList } from "@/hooks/useAssetList";
import { useLocationParams } from "@/hooks/useLocationParams";
import { PageWithHeader } from "@/layouts/Page";
import { Flex, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { type InnerChainUniqueId } from "core/types/ChainUniqueId";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import { EmptyView } from "@/components/Custom/EmptyView";
import { Content } from "@/layouts/Content";
import { type TokenV2 } from "core/types/Token";

const SelectTokenScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uniqueId, address } = useParams();

  const nextPage = useLocationParams("page");
  const currTokenStr = useLocationParams("currToken");
  const currToken: TokenV2 | undefined = currTokenStr
    ? JSON.parse(currTokenStr)
    : undefined;
  const { assets } = useAssetList(uniqueId as InnerChainUniqueId, address!);

  const [searchStr, setSearchStr] = useState("");

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setSearchStr(value);
    },
    [],
  );

  const onTokenClick = (token: TokenV2) => {
    console.log(
      "===> url",
      `${nextPage}?token=${serializeToken(token)}`,
      " location ",
      JSON.stringify(location),
    );
    navigate(`/${nextPage}?token=${serializeToken(token)}`, {
      replace: true,
    });
  };

  const { searchRes, delaySearchStr } = useFuseSearch(searchStr, assets, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "symbol", weight: 0.5 },
    ],
    threshold: 0.3,
  });

  const listData = useMemo(() => {
    return delaySearchStr ? searchRes : assets;
  }, [delaySearchStr, searchRes, assets]);

  return (
    <PageWithHeader
      title={t("SelectToken:title")}
      enableBack
      onBack={() => {
        // navigate(`/${nextPage}?token=${currToken?.tokenId}`);
        if (currToken) {
          navigate(`/${nextPage}?token=${serializeToken(currToken)}`, {
            replace: true,
          });
        }
        return false;
      }}
    >
      <InputGroup flexDir={"column"} px={5} position={"relative"}>
        <InputLeftElement position={"absolute"} top={"calc(50% - 13px)"} ml={8}>
          <IconSearch w={"26px"} h={"26px"} />
        </InputLeftElement>
        <Input
          alignSelf={"stretch"}
          bg={"gray.50"}
          value={searchStr}
          onChange={onInputChange}
          placeholder={t("SelectToken:searchToken")}
          pl={10}
          py={2}
        />
      </InputGroup>
      <Flex maxH={"400px"} overflowY={"auto"} flexDir={"column"}>
        {listData.length === 0
          ? delaySearchStr && (
              <Content align={"center"} justifyContent={"center"} mt={10}>
                <EmptyView
                  searching={false}
                  text={t("Common:noSearchResult")}
                />
              </Content>
            )
          : listData.map((token) => {
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

        {}
      </Flex>
    </PageWithHeader>
  );
};

export default SelectTokenScreen;
