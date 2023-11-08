import { AleoWorker } from "../../../offscreen/aleo";
import init from "aleo_wasm";
import { syncBlocks, initWorker } from "../../../offscreen/offscreen_helper";
import { Future } from "aleo_wasm";
import { parseU64 } from "../../../offscreen/helper";

// export async function main() {
//   await init();
//   const worker = new AleoWorker(["https://dev.foxnb.net/api/v1/aleo"]);
//   const resp = await worker.syncBlocks({
//     viewKey: "AViewKey1cYH2yRXZnF8zA7BkvJEbb1jvbkjWwg6o62gL2Lkcu87y",
//     begin: 240071,
//     end: 240073,
//   });
//   console.log("===> resp: ", resp);
// }

export async function main() {
  await initWorker([
    "https://dev.foxnb.net/api/v1/aleo",
    "https://vm.aleo.org/api",
  ]);
  const resp = await syncBlocks({
    viewKey: "AViewKey1cYH2yRXZnF8zA7BkvJEbb1jvbkjWwg6o62gL2Lkcu87y",
    begin: 132989,
    end: 132991,
  });
  console.log("===> resp: ", resp);
  // const future = Future.fromString(
  //   "{\n  program_id: credits.aleo,\n  function_name: fee_public,\n  arguments: [\n    aleo1xs53pjftr8vst9ev2drwdu0kyyj2f4fxx93j3n30hfr8dqjnwq8qyvka7t,\n    12210u64\n  ]\n}",
  // );
  // console.log("==> future: ", JSON.parse(future.toJSON()));
  // const u64 = parseU64("12210u64");
  // console.log("===> u64: ", u64);
}
