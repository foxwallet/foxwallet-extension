import {
  Address,
  Field,
  Plaintext,
  Poseidon4,
} from "provable-wasm-no-tla/mainnet.js";
import {
  ALEO_ZERO_ADDRESS,
  COMPLIANCE_FREEZELIST_PROGRAM,
  isComplianceProgram,
  SEALANCE_GENERATE_LEAVES_DEPTH,
  SEALANCE_SIBLING_PATH_DEPTH,
} from "../../constants";
import { ProvableApi } from "../api/provable";

type SiblingPath = {
  siblings: bigint[];
  leafIndex: number;
};

type ComplianceProofCacheEntry = {
  merkleRoot: string;
  // address -> formatted Aleo plaintext proof literal
  proofs: Map<string, string>;
};

// Port of @provablehq/sdk's SealanceMerkleTree built on top of the wasm bindings
// we already use elsewhere (provable-wasm-no-tla). Algorithms mirror the SDK
// exactly so proofs verify against the on-chain freezelist programs.
class SealanceMerkleTree {
  private readonly hasher: Poseidon4;

  constructor() {
    this.hasher = new Poseidon4();
  }

  // Convert an Aleo address to its underlying field element. The SDK does this
  // by bech32m-decoding the address bytes; the wasm Address class exposes the
  // same value directly via toField().
  private addressToFieldBigInt(address: string): bigint {
    const addr = Address.from_string(address);
    return fieldToBigInt(addr.toField());
  }

  // Hash two field-typed elements with a domain-separation prefix using
  // Poseidon4 over `[prefix, el1, el2]`.
  private hashTwoElements(prefix: string, el1: string, el2: string): string {
    const literal = `[${prefix}, ${el1}, ${el2}]`;
    const plaintext = Plaintext.fromString(literal);
    const hash = this.hasher.hash(plaintext.toFields());
    return hash.toString();
  }

  // Filter zero addresses, sort by field value, pad with zero leaves up to the
  // next power of two. Output is "<field>field" strings ready for buildTree.
  generateLeaves(
    addresses: string[],
    maxTreeDepth: number = SEALANCE_GENERATE_LEAVES_DEPTH,
  ): string[] {
    const maxNumLeaves = Math.floor(2 ** (maxTreeDepth - 1));
    const filtered = addresses.filter((addr) => addr !== ALEO_ZERO_ADDRESS);

    let numLeaves: number;
    if (filtered.length <= 1) {
      numLeaves = 2;
    } else {
      numLeaves = 2 ** Math.ceil(Math.log2(filtered.length));
    }
    if (filtered.length > maxNumLeaves) {
      throw new Error(
        `Sealance leaves limit exceeded. Max: ${maxNumLeaves}, provided: ${filtered.length}`,
      );
    }

    const addressFields = filtered.map((addr) => this.addressToFieldBigInt(addr));
    addressFields.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    const fieldLiterals = addressFields.map((field) => `${field.toString()}field`);
    const padding = Array(Math.max(numLeaves - fieldLiterals.length, 0)).fill(
      "0field",
    );
    return [...padding, ...fieldLiterals];
  }

  // Bottom-up Merkle tree; nodes at the leaf level use a domain prefix of
  // "1field" while interior nodes use "0field". Returns the complete tree as
  // BigInts (root is the last element).
  buildTree(leaves: string[]): bigint[] {
    if (leaves.length === 0) {
      throw new Error("Leaves array cannot be empty");
    }
    if (leaves.length % 2 !== 0) {
      throw new Error("Leaves array must have even number of elements");
    }

    let currentLevel = leaves;
    let tree: string[] = [...currentLevel];
    let levelSize = currentLevel.length;

    while (levelSize > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < levelSize; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        const prefix = leaves.length === levelSize ? "1field" : "0field";
        nextLevel.push(this.hashTwoElements(prefix, left, right));
      }
      tree = [...tree, ...nextLevel];
      currentLevel = nextLevel;
      levelSize = currentLevel.length;
    }

    return tree.map((element) =>
      BigInt(element.slice(0, element.length - "field".length)),
    );
  }

  // Non-inclusion lookup: returns the two adjacent leaf indices that bracket
  // `address`. When the address falls before/after the bounds, both indices
  // collapse to the boundary leaf.
  getLeafIndices(merkleTree: bigint[], address: string): [number, number] {
    const numLeaves = Math.floor((merkleTree.length + 1) / 2);
    const target = this.addressToFieldBigInt(address);
    const leaves = merkleTree.slice(0, numLeaves);

    let rightLeafIndex = leaves.findIndex((leaf) => target <= leaf);
    let leftLeafIndex = rightLeafIndex - 1;
    if (rightLeafIndex === -1) {
      rightLeafIndex = leaves.length - 1;
      leftLeafIndex = leaves.length - 1;
    }
    if (rightLeafIndex === 0) {
      leftLeafIndex = 0;
    }
    return [leftLeafIndex, rightLeafIndex];
  }

  // Standard Merkle inclusion proof for a leaf at `leafIndex`, padded with
  // zero siblings up to `depth`.
  getSiblingPath(tree: bigint[], leafIndex: number, depth: number): SiblingPath {
    const numLeaves = Math.floor((tree.length + 1) / 2);
    const siblings: bigint[] = [];
    let index = leafIndex;
    let parentIndex = numLeaves;

    siblings.push(tree[index]);
    let level = 1;
    while (parentIndex < tree.length) {
      const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
      siblings.push(tree[siblingIndex]);
      index = parentIndex + Math.floor(leafIndex / 2 ** level);
      parentIndex += Math.floor(numLeaves / 2 ** level);
      level++;
    }
    while (level < depth) {
      siblings.push(0n);
      level++;
    }
    return { siblings, leafIndex };
  }
}

// "9876field" -> 9876n. The wasm Field.toString() returns the literal form.
function fieldToBigInt(field: Field): bigint {
  const str = field.toString();
  const digits = str.endsWith("field") ? str.slice(0, -"field".length) : str;
  return BigInt(digits);
}

function formatMerkleProof(paths: SiblingPath[]): string {
  const formatted = paths
    .map((item) => {
      const siblings = item.siblings.map((s) => `${s}field`).join(", ");
      return `{ siblings: [${siblings}], leaf_index: ${item.leafIndex}u32 }`;
    })
    .join(", ");
  return `[${formatted}]`;
}

function convertTreeStringsToBigInt(tree: string[]): bigint[] {
  return tree.map((element) => {
    try {
      return BigInt(element);
    } catch {
      throw new Error(`Invalid decimal U256 string from freezelist: ${element}`);
    }
  });
}

// Empty-tree helper for the case where the freezelist API is unavailable; the
// reference implementation returns the same constant proof in that scenario so
// transactions can still proceed.
function buildEmptyTree(): bigint[] {
  const tree = new SealanceMerkleTree();
  const leaves = tree.generateLeaves([]);
  return tree.buildTree(leaves);
}

export class ComplianceService {
  private readonly provableApi: ProvableApi;
  private readonly network: string;
  // Cache keyed by `${programId}` (freezelist program id). Holds the last
  // observed Merkle root and per-address proofs so we don't recompute on every
  // transaction.
  private readonly cache = new Map<string, ComplianceProofCacheEntry>();

  constructor(network: string, provableApi: ProvableApi = new ProvableApi()) {
    this.network = network;
    this.provableApi = provableApi;
  }

  // Returns the formatted compliance proof literal expected by compliance
  // stablecoin transfer_private functions. Returns "" for non-compliance
  // programs so callers can branch on emptiness.
  async getComplianceProof(
    stablecoinProgramId: string,
    address: string,
  ): Promise<string> {
    if (!isComplianceProgram(stablecoinProgramId)) {
      return "";
    }
    const freezelistProgramId =
      COMPLIANCE_FREEZELIST_PROGRAM[stablecoinProgramId];
    if (!freezelistProgramId) {
      throw new Error(
        `No freezelist program configured for ${stablecoinProgramId}`,
      );
    }

    const tree = await this.fetchTree(freezelistProgramId);
    const merkleRoot = tree[tree.length - 1].toString();

    const cached = this.cache.get(freezelistProgramId);
    if (cached?.merkleRoot === merkleRoot) {
      const existing = cached.proofs.get(address);
      if (existing !== undefined) {
        return existing;
      }
    }

    const proof = this.generateProof(address, tree);

    if (cached?.merkleRoot === merkleRoot) {
      cached.proofs.set(address, proof);
    } else {
      // Root changed (or first time) — drop any stale proofs from the previous
      // root since they would no longer verify.
      this.cache.set(freezelistProgramId, {
        merkleRoot,
        proofs: new Map([[address, proof]]),
      });
    }
    return proof;
  }

  private async fetchTree(freezelistProgramId: string): Promise<bigint[]> {
    try {
      const freezeList = await this.provableApi.getProgramFreezeList(
        this.network,
        freezelistProgramId,
      );
      if (freezeList.length === 0) {
        return buildEmptyTree();
      }
      return convertTreeStringsToBigInt(freezeList);
    } catch (err) {
      console.error(
        `[ComplianceService] failed to fetch freeze list for ${freezelistProgramId}, falling back to empty tree:`,
        err,
      );
      return buildEmptyTree();
    }
  }

  private generateProof(address: string, tree: bigint[]): string {
    const sealance = new SealanceMerkleTree();
    const [leftIdx, rightIdx] = sealance.getLeafIndices(tree, address);
    const leftPath = sealance.getSiblingPath(
      tree,
      leftIdx,
      SEALANCE_SIBLING_PATH_DEPTH,
    );
    const rightPath = sealance.getSiblingPath(
      tree,
      rightIdx,
      SEALANCE_SIBLING_PATH_DEPTH,
    );
    return formatMerkleProof([leftPath, rightPath]);
  }
}

export const createComplianceService = (network: string): ComplianceService => {
  return new ComplianceService(network);
};
