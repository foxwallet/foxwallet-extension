import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";
import {
  isSidePanel,
  WALLET_UI_PORT,
  type WalletUIMessage,
} from "@/common/utils/walletUI";

export function useConfirmUI() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = useRef({ location, navigate });
  current.current = { location, navigate };
  const active = useRef<{
    requestId: string;
    path: string;
    previous: typeof location;
  }>();
  const [confirmPath, setConfirmPath] = useState<string>();

  useEffect(() => {
    if (!isSidePanel()) return;
    let disposed = false;
    let port: browser.Runtime.Port | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    const restore = () => {
      const previous = active.current?.previous;
      active.current = undefined;
      setConfirmPath(undefined);
      if (previous)
        current.current.navigate(previous, {
          replace: true,
          state: previous.state,
        });
    };
    const connect = async () => {
      const window = await browser.windows.getCurrent();
      if (disposed || window.id === undefined) return;
      port = browser.runtime.connect({ name: WALLET_UI_PORT });
      port.onMessage.addListener((message: WalletUIMessage) => {
        if (message.type === "confirm-open") {
          active.current = {
            requestId: message.requestId,
            path: message.path,
            previous: current.current.location,
          };
          setConfirmPath(message.path);
          current.current.navigate(message.path, { replace: true });
        } else if (
          message.type === "confirm-done" &&
          active.current?.requestId === message.requestId
        ) {
          restore();
        } else if (message.type === "navigate" && !active.current) {
          current.current.navigate(message.path);
        }
      });
      port.onDisconnect.addListener(() => {
        if (disposed) return;
        restore();
        reconnect = setTimeout(() => {
          void connect().catch(retry);
        }, 1000);
      });
      port.postMessage({ type: "ready", windowId: window.id });
    };
    const retry = () => {
      if (!disposed)
        reconnect = setTimeout(() => {
          void connect().catch(retry);
        }, 1000);
    };
    void connect().catch(retry);
    return () => {
      disposed = true;
      clearTimeout(reconnect);
      port?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (confirmPath && location.pathname !== confirmPath)
      navigate(confirmPath, { replace: true });
  }, [confirmPath, location.pathname, navigate]);
}
