import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from "@chakra-ui/react";
import { promisifyChooseDialogWrapper } from "../../../common/utils/dialog";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export enum SelectJoinSplitOption {
  SPLIT = "split",
  JOIN = "join",
}

interface Props {
  isOpen: boolean;
  onConfirm: (option: SelectJoinSplitOption) => void;
  onCancel: () => void;
}

const SelectJoinSplit = (props: Props) => {
  const { isOpen, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  const optionMap = useMemo(() => {
    return {
      [SelectJoinSplitOption.JOIN]: {
        title: t("JoinSplit:join"),
        desc: t("JoinSplit:joinDesc"),
      },
      [SelectJoinSplitOption.SPLIT]: {
        title: t("JoinSplit:split"),
        desc: t("JoinSplit:splitDesc"),
      },
    };
  }, [t]);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onCancel}>
      <DrawerOverlay />
      <DrawerContent bg={"white"} px="6" py="4">
        <DrawerCloseButton position={"absolute"} top={5} right={6} />
        <DrawerHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {t("JoinSplit:selectMethod")}
        </DrawerHeader>
        <DrawerBody>
          <Flex direction={"column"}>
            <Flex
              key={SelectJoinSplitOption.JOIN}
              mt="2"
              px={"4"}
              py={"3"}
              border="1.5px solid"
              borderColor={"gray.50"}
              borderRadius={"lg"}
              justify={"space-between"}
              align={"center"}
              onClick={() => onConfirm(SelectJoinSplitOption.JOIN)}
            >
              <Text>{optionMap[SelectJoinSplitOption.JOIN].title}</Text>
              <Text fontSize={"small"} color={"gray.500"}>
                {optionMap[SelectJoinSplitOption.JOIN].desc}
              </Text>
            </Flex>
            <Flex
              key={SelectJoinSplitOption.SPLIT}
              mt="2"
              px={"4"}
              py={"3"}
              border="1.5px solid"
              borderColor={"gray.50"}
              borderRadius={"lg"}
              justify={"space-between"}
              align={"center"}
              onClick={() => onConfirm(SelectJoinSplitOption.SPLIT)}
            >
              <Text>{optionMap[SelectJoinSplitOption.SPLIT].title}</Text>
              <Text fontSize={"small"} color={"gray.500"}>
                {optionMap[SelectJoinSplitOption.SPLIT].desc}
              </Text>
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export const showSelectJoinSplitDialog =
  promisifyChooseDialogWrapper(SelectJoinSplit);
