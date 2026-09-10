import { actions } from "@/store/actions";
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
      dispatch(actions.user.setHasAuth({ hasAuth }));
    } catch (err) {
      console.error("getAuth failed: ", err);
      dispatch(actions.user.setHasAuth({ hasAuth: false }));
    } finally {
      setLoading(false);
    }
  }, [popupServerClient, dispatch]);

  const login = useCallback(
    async (password: string) => {
      const res = await popupServerClient.login({ password });
      if (res) {
        dispatch(actions.user.setHasAuth({ hasAuth: true }));
        // console.log("resyncAllWalletsToStore called");
        await dispatch(actions.accountV2.resyncAllWalletsToStore());
      }
      return res;
    },
    [dispatch, popupServerClient],
  );

  const lock = useCallback(async () => {
    await popupServerClient.lock();
    dispatch(actions.user.setHasAuth({ hasAuth: false }));
  }, [dispatch, popupServerClient]);

  const checkPassword = useCallback(
    async (password: string) => {
      return await popupServerClient.checkPassword(password);
    },
    [popupServerClient],
  );

  useEffect(() => {
    void getAuth();
  }, [getAuth, popupServerClient]);

  return {
    loading,
    hasAuth,
    getAuth,
    login,
    lock,
    checkPassword,
  };
};
