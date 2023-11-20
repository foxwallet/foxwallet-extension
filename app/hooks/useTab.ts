import { useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { useDataRef } from "./useDataRef";
import { logger } from "@/common/utils/logger";

export const openInTab = async () => {
  const url = browser.runtime.getURL("index.html");
  const tab = await browser.tabs.create({ url });
  return tab;
};

export const getIsInTab = async () => {
  const tab = await browser.tabs.getCurrent();
  return !!tab;
};

export const useIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false);
  useEffect(() => {
    getIsInTab()
      .then((value) => {
        setIsInTab(value);
      })
      .catch((err) => {
        logger.error("===> getIsInTab error: ", err);
      });
  }, []);
  return isInTab;
};

export const useBrowserTab = () => {
  const isInTab = useIsInTab();

  const openTabIfNeed = useCallback(async () => {
    const isInTab = await getIsInTab();
    if (!isInTab) {
      await openInTab();
      window.close();
    }
  }, []);

  return { isInTab, openTabIfNeed };
};
