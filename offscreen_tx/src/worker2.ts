import { initThreadPool, PrivateKey, ProgramManager } from "@aleohq/wasm";

await initThreadPool();

addEventListener("message", async (event) => {
  try {
    const result = await execute();
    postMessage({ data: result, error: null });
  } catch (err) {
    postMessage({ data: null, error: (err as Error).message });
  }
});

async function execute() {
  const hello_hello_program =
    "program hello_hello.aleo;\n" +
    "\n" +
    "function hello:\n" +
    "    input r0 as u32.public;\n" +
    "    input r1 as u32.private;\n" +
    "    add r0 r1 into r2;\n" +
    "    output r2 as u32.private;\n";

  async function localProgramExecution() {
    // Create a temporary account for the execution of the program
    const pk = new PrivateKey();

    const executionResponse = await ProgramManager.executeFunctionOffline(
      pk,
      hello_hello_program,
      "hello",
      ["5u32", "5u32"],
      false,
      false,
    );
    return executionResponse.getOutputs();
  }

  const start = Date.now();
  console.log("Starting execute!");
  const result = await localProgramExecution();
  console.log("Execute finished!", Date.now() - start);
  return result;
}

postMessage({ type: "inited" });
