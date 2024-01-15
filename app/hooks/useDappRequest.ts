import { DappRequest } from "@/database/types/dapp";
import { dappService } from "@/services/dapp/DappService";
import { useCallback, useEffect, useState } from "react";

export const useDappRequest = (requestId?: string) => {
  const [dappRequest, setDappRequest] = useState<DappRequest | undefined>();
  const [loading, setLoading] = useState(false);

  const getDappRequest = useCallback(async () => {
    if (!requestId) {
      return;
    }
    setLoading(true);
    try {
      const request = await dappService.getDappRequest(requestId);
      setDappRequest(request);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    getDappRequest();
  }, [getDappRequest]);

  return {
    dappRequest,
    loading,
  };
};
