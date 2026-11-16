import { type AleoFeeProgram, type AleoRpc } from "../api/rpc";
import { estimateFeeInWorker } from "./client";
import { type FeeEstimateRequest } from "./estimate";

type FeeRpc = Pick<
  AleoRpc,
  "getFeeProgram" | "getLatestHeight" | "getBlockRange"
>;
type FeeEstimator = (request: FeeEstimateRequest) => Promise<bigint>;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function readPriorityFee(confirmed: unknown): bigint | undefined {
  if (!isObject(confirmed) || confirmed.status !== "accepted") return;
  const tx = confirmed.transaction;
  if (!isObject(tx) || !isObject(tx.fee)) return;
  const transition = tx.fee.transition;
  if (!isObject(transition) || transition.program !== "credits.aleo") return;
  const index =
    transition.function === "fee_public"
      ? 1
      : transition.function === "fee_private"
      ? 2
      : undefined;
  if (index === undefined || !Array.isArray(transition.inputs)) return;
  const input: unknown = transition.inputs[index];
  if (
    !isObject(input) ||
    typeof input.value !== "string" ||
    !/^\d+u64$/.test(input.value)
  )
    return;
  const fee = BigInt(input.value.slice(0, -3));
  return fee <= (1n << 64n) - 1n ? fee : undefined;
}

export class AleoFeeService {
  private baseFees = new Map<
    string,
    { request: Promise<bigint>; expires: number }
  >();

  private priority?: { fee: bigint; expires: number };
  private lastPriority?: { fee: bigint; time: number };
  private priorityRequest?: Promise<bigint>;

  constructor(
    private readonly rpc: FeeRpc,
    private readonly network: string,
    private readonly estimate: FeeEstimator = estimateFeeInWorker,
  ) {}

  async getBaseFee(programId: string, functionName: string): Promise<bigint> {
    if (this.network !== "mainnet")
      throw new Error("Aleo fee estimation supports mainnet only");
    // credits/split burns this amount internally and has no fee transition.
    if (programId === "credits.aleo" && functionName === "split") return 10000n;
    const key = `${programId}/${functionName}`;
    const cached = this.baseFees.get(key);
    if (cached && cached.expires > Date.now()) return await cached.request;
    const request = this.estimateBaseFee(programId, functionName);
    this.baseFees.set(key, { request, expires: Date.now() + 30000 });
    if (this.baseFees.size > 32) {
      const oldest = this.baseFees.keys().next().value;
      if (oldest !== undefined) this.baseFees.delete(oldest);
    }
    try {
      return await request;
    } catch (error) {
      if (this.baseFees.get(key)?.request === request)
        this.baseFees.delete(key);
      throw error;
    }
  }

  private async estimateBaseFee(
    programId: string,
    functionName: string,
  ): Promise<bigint> {
    const programs: AleoFeeProgram[] = [];
    const visited = new Set<string>();
    const active = new Set<string>();
    const visit = async (id: string): Promise<void> => {
      if (visited.has(id)) return;
      if (active.has(id)) throw new Error("Cyclic Aleo program imports");
      if (active.size + visited.size >= 128)
        throw new Error("Too many Aleo program imports");
      active.add(id);
      const program = await this.rpc.getFeeProgram(id);
      const source = program.source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
      for (const dependency of source.matchAll(
        /\bimport\s+([a-z][a-z0-9_]*\.aleo)\s*;/g,
      )) {
        await visit(dependency[1]);
      }
      active.delete(id);
      visited.add(id);
      programs.push(program);
    };
    await visit(programId);
    const fee = await this.estimate({ programs, functionName });
    if (typeof fee !== "bigint" || fee <= 0n)
      throw new Error("Invalid Aleo base fee estimate");
    return fee;
  }

  async getPriorityFee(): Promise<bigint> {
    if (this.priority && this.priority.expires > Date.now())
      return this.priority.fee;
    this.priorityRequest ??= this.estimatePriorityFee();
    try {
      return await this.priorityRequest;
    } finally {
      this.priorityRequest = undefined;
    }
  }

  private async estimatePriorityFee(): Promise<bigint> {
    let fee: bigint;
    let successful = false;
    try {
      const height = await this.rpc.getLatestHeight();
      if (!Number.isSafeInteger(height) || height < 0)
        throw new Error("Invalid Aleo height");
      // The range end is exclusive; include the most recent block.
      const blocks = await this.rpc.getBlockRange(
        Math.max(0, height - 9),
        height + 1,
      );
      const samples = blocks
        .flatMap((block) =>
          (block.transactions ?? [])
            .map(readPriorityFee)
            .filter((value): value is bigint => value !== undefined),
        )
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      if (!samples.length)
        throw new Error("No recent Aleo priority fee samples");
      fee = samples[Math.ceil(samples.length * 0.75) - 1];
      this.lastPriority = { fee, time: Date.now() };
      successful = true;
    } catch {
      fee =
        this.lastPriority && Date.now() - this.lastPriority.time < 600000
          ? this.lastPriority.fee
          : 100000n;
    }
    this.priority = { fee, expires: Date.now() + (successful ? 30000 : 10000) };
    return fee;
  }
}
