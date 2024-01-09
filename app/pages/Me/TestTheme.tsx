import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { ColorMode } from "@/store/setting";
import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { isEqual } from "lodash";
import { useMemo } from "react";

const TestTheme = () => {
  const dispatch = usePopupDispatch();
  const { setColorMode } = useColorMode();

  const currColorMode = usePopupSelector(
    (state) => state.setting.colorMode,
    isEqual,
  );

  const currModeTitle = useMemo(() => {
    if (currColorMode === "light") return "Light";
    if (currColorMode === "dark") return "Dark";
    return "System";
  }, [currColorMode]);

  return (
    <Flex align={"center"} justify={"space-between"}>
      <Text>Theme</Text>
      <Menu>
        <MenuButton>{currModeTitle}</MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => {
              setColorMode("light");
              dispatch.setting.changeColorModel({ colorMode: ColorMode.Light });
            }}
          >
            Light
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColorMode("dark");
              dispatch.setting.changeColorModel({ colorMode: ColorMode.Dark });
            }}
          >
            Dark
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColorMode("system");
              dispatch.setting.changeColorModel({
                colorMode: ColorMode.System,
              });
            }}
          >
            System
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default TestTheme;
