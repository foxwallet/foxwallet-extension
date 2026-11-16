import { estimateExecutionFee, type FeeEstimateRequest } from "./estimate";

addEventListener("message", (event: MessageEvent<FeeEstimateRequest>) => {
  void estimateExecutionFee(event.data).then(
    (fee) => postMessage({ fee: fee.toString() }),
    (error: unknown) =>
      postMessage({
        error: error instanceof Error ? error.message : String(error),
      }),
  );
});
