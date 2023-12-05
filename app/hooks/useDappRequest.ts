import { DappRequest } from "@/scripts/background/types/dapp";
import { dappService } from "@/services/dapp/DappService";
import { useCallback, useEffect, useState } from "react";

export const useDappRequest = (requestId?: string) => {
  const [dappRequest, setDappRequest] = useState<DappRequest | null>(null);
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
