import { IconWeb } from "@/components/Custom/Icon";
import { type SiteInfo } from "@/scripts/content/host";
import { Flex, Image, Text } from "@chakra-ui/react";

interface DappInfoProps {
  siteInfo: SiteInfo;
}

export const DappInfo = (props: DappInfoProps) => {
  const { siteInfo } = props;
  const { origin, name, icon } = siteInfo;
  return (
    <Flex
      alignSelf={"stretch"}
      justify={"space-between"}
      align={"center"}
      borderRadius={"lg"}
      borderStyle={"solid"}
      borderWidth={"1px"}
      borderColor={"gray.50"}
      flex={1}
      p={2}
    >
      <Image
        src={icon ?? undefined}
        fallback={<IconWeb w={8} h={8} />}
        fallbackStrategy="beforeLoadOrError"
        w={8}
        h={8}
        borderRadius={16}
        borderWidth={"1px"}
        borderStyle={"solid"}
        borderColor={"gray.50"}
        mr={2}
        flexShrink={0}
      />
      <Flex flexDir={"column"} align={"flex-end"} minW={0} flex={1}>
        <Text
          textOverflow={"ellipsis"}
          overflow={"hidden"}
          whiteSpace={"nowrap"}
          fontWeight={"bold"}
          maxWidth={250}
          width={"100%"}
          textAlign={"right"}
        >
          {name}
        </Text>
        <Text
          whiteSpace={"normal"}
          overflowWrap={"anywhere"}
          wordBreak={"break-all"}
          dir={"ltr"}
          textAlign={"right"}
          width={"100%"}
          fontWeight={"bold"}
          color={"gray.500"}
          fontSize={"13"}
        >
          {origin}
        </Text>
      </Flex>
    </Flex>
  );
};
