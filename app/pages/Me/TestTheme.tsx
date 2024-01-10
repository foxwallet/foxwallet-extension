import { popupEvents } from "@/common/utils/event";
import { usePopupDispatch, usePopupSelector } from "@/hooks/useStore";
import { ColorMode } from "@/store/setting";
import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  localStorageManager,
  useColorMode,
} from "@chakra-ui/react";
import { isEqual } from "lodash";
import { useEffect, useMemo } from "react";

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
              popupEvents.emit("changeColorMode", "light");
              dispatch.setting.changeColorModel({ colorMode: ColorMode.Light });
            }}
          >
            Light
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColorMode("dark");
              popupEvents.emit("changeColorMode", "dark");
              dispatch.setting.changeColorModel({ colorMode: ColorMode.Dark });
            }}
          >
            Dark
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColorMode("system");
              popupEvents.emit("changeColorMode", "system");
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
