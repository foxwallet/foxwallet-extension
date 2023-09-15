import CheckCircle from "@/common/assets/image/icon_check_circle.svg";
import CheckLine from "@/common/assets/image/icon_check_line.svg";
import CloseLine from "@/common/assets/image/icon_close_line.svg";
import EyeClose from "@/common/assets/image/icon_eye_close.svg";
import Eye from "@/common/assets/image/icon_eye_on.svg";
import Left from "@/common/assets/image/icon_left.svg";
import Logo from "../../common/assets/image/onboard_logo.svg";
import { chakra } from "@chakra-ui/react";

// @ts-expect-error IconCheckCircle
export const IconCheckCircle = chakra(CheckCircle);

// @ts-expect-error IconCheckLine
export const IconCheckLine = chakra(CheckLine);

// @ts-expect-error IconCloseLine
export const IconCloseLine = chakra(CloseLine);

// @ts-expect-error IconEyeClose
export const IconEyeClose = chakra(EyeClose);

// @ts-expect-error IconEyeOn
export const IconEyeOn = chakra(Eye);

// @ts-expect-error IconLeft
export const IconLeft = chakra(Left);

// @ts-expect-error OnboardLogo
export const OnboardLogo = chakra(Logo);
