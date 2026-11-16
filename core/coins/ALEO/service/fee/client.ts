import FeeWorker from "./worker?worker";
import { type FeeEstimateRequest } from "./estimate";

export async function estimateFeeInWorker(
  request: FeeEstimateRequest,
): Promise<bigint> {
  return await new Promise((resolve, reject) => {
    let bootstrapUrl: string | undefined;
    let worker: Worker;
    if (import.meta.env.DEV) {
      const url = new URL(
        "./worker.ts?worker_file&type=module",
        import.meta.url,
      ).href;
      bootstrapUrl = URL.createObjectURL(
        new Blob([`import ${JSON.stringify(url)};`], {
          type: "text/javascript",
        }),
      );
      worker = new Worker(bootstrapUrl, { type: "module" });
    } else {
      worker = new FeeWorker();
    }
    const finish = (error?: string, fee?: bigint) => {
      clearTimeout(timer);
      worker.terminate();
      if (bootstrapUrl) URL.revokeObjectURL(bootstrapUrl);
      if (error) reject(new Error(error));
      else if (fee !== undefined) resolve(fee);
    };
    const timer = setTimeout(
      () => finish("Aleo fee estimation timed out"),
      30000,
    );
    worker.onmessage = (
      event: MessageEvent<{ fee?: string; error?: string }>,
    ) => {
      if (event.data.error) {
        finish(event.data.error);
        return;
      }
      if (!event.data.fee || !/^\d+$/.test(event.data.fee)) {
        finish("Invalid Aleo fee estimate");
        return;
      }
      finish(undefined, BigInt(event.data.fee));
    };
    worker.onerror = (event) =>
      finish(event.message || "Aleo fee worker failed");
    worker.postMessage(request);
  });
}
