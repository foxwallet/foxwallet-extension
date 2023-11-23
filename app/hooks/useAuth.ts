import { useCallback, useEffect, useState } from "react";
import { useClient } from "./useClient";
import { usePopupDispatch, usePopupSelector } from "./useStore";

export const useAuth = () => {
  const hasAuth = usePopupSelector((state) => state.user.hasAuth);
  const dispatch = usePopupDispatch();
  const { popupServerClient } = useClient();
  const [loading, setLoading] = useState(true);

  const getAuth = useCallback(async () => {
    setLoading(true);
    try {
      const hasAuth = await popupServerClient.hasAuth();
      console.log("===> hasAuth: ", hasAuth);
      dispatch.user.setHasAuth({ hasAuth });
    } catch (err) {
      console.error("getAuth failed: ", err);
      dispatch.user.setHasAuth({ hasAuth: false });
    } finally {
      setLoading(false);
    }
  }, [popupServerClient, dispatch]);

  const login = useCallback(async (password: string) => {
    const res = await popupServerClient.login({ password });
    if (res) {
      dispatch.user.setHasAuth({ hasAuth: true });
    }
    return res;
  }, []);

  const lock = useCallback(async () => {
    await popupServerClient.lock();
    dispatch.user.setHasAuth({ hasAuth: false });
  }, []);

  const timeoutLock = useCallback(async () => {
    return await popupServerClient.timeoutLock();
  }, []);

  useEffect(() => {
    void getAuth();

    return () => {
      timeoutLock();
    };
  }, [getAuth, popupServerClient]);

  return {
    loading,
    hasAuth,
    getAuth,
    login,
    lock,
    timeoutLock,
  };
};
