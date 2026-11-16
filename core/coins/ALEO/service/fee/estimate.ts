import {
  ProgramImports,
  ProgramManager,
} from "provable-wasm-no-tla/mainnet.js";
import { initAleoWasm } from "../../utils/wasmInit";
import { type AleoFeeProgram } from "../api/rpc";

export type FeeEstimateRequest = {
  programs: AleoFeeProgram[];
  functionName: string;
};

// Programs arrive in dependency order, with the executed program last.
export async function estimateExecutionFee({
  programs,
  functionName,
}: FeeEstimateRequest): Promise<bigint> {
  await initAleoWasm();
  const program = programs.at(-1);
  if (!program) throw new Error("Missing Aleo fee program");
  const imports = new ProgramImports();
  try {
    for (const dependency of programs.slice(0, -1)) {
      if (dependency.id !== "credits.aleo") {
        imports.addProgram(
          dependency.id,
          dependency.source,
          dependency.edition,
        );
      }
    }
    const fee = ProgramManager.estimateExecutionFee(
      program.source,
      functionName,
      undefined,
      program.edition,
      // The WASM call consumes its ProgramImports argument.
      imports.clone(),
    );
    if (fee <= 0n) throw new Error("Invalid Aleo base fee estimate");
    return fee;
  } finally {
    imports.free();
  }
}
