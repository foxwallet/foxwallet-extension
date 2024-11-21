import { type PropsWithChildren, useMemo } from "react";
import UpgradeReminderScreen from "@/pages/Onboard/UpgradeReminder";
import { CHROME_MIN_VERSION } from "@/common/constants";

export const CheckBrowserVersion = (props: PropsWithChildren): JSX.Element => {
  const showReminder = useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (!userAgent.includes("chrome")) {
      return false;
    }

    const matched = userAgent.match(/chrome\/[\d.]+/gi);
    if (matched?.[0]) {
      const versionCmps = matched[0].split("/");
      return parseFloat(versionCmps[1]) < parseFloat(CHROME_MIN_VERSION);
    }

    return false;
  }, []);

  if (showReminder) {
    return <UpgradeReminderScreen />;
  }

  return <>{props.children}</>;
};
