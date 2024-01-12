import { useEffect, useState } from "react";
import UpgradeReminderScreen from "@/pages/Onboard/UpgradeReminder";
import { CHROME_MIN_VERSION } from "@/common/constants";

const compareBrowserVersion = (ver1: string, ver2: string) => {
  let version1pre = parseFloat(ver1);
  let version2pre = parseFloat(ver2);
  let version1next = ver1.replace(version1pre + ".", "");
  let version2next = ver2.replace(version2pre + ".", "");

  if (version1pre >= version2pre) {
    return true;
  } else if (version1pre < version2pre) {
    return false;
  }
  return version1next >= version2next;
};

export const CheckVersion = (props: { children: React.ReactNode }) => {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const checkChromeVersion = async () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (!userAgent.includes("chrome")) return;

      const matched = userAgent.match(/chrome\/[\d.]+/gi);
      if (matched?.[0]) {
        const versionCmps = matched[0].split("/");
        const isValidVerson = compareBrowserVersion(
          versionCmps[1],
          CHROME_MIN_VERSION,
        );
        setShowReminder(!isValidVerson);
      }
    };
    checkChromeVersion();
  }, []);

  if (showReminder) {
    return <UpgradeReminderScreen />;
  }

  return <>{props.children}</>;
};
