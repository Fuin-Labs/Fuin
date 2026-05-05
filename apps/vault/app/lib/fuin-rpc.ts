"use client";

import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idlJson from "./fuin-idl.json";

export const FUIN_V2_PROGRAM_ID = new PublicKey(
  "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy"
);

export const RPC_URL =
  process.env.NEXT_PUBLIC_FUIN_RPC ?? "https://api.devnet.solana.com";

export const idl = idlJson as unknown as anchor.Idl;

export type IntentNode = {
  pda: string;
  user: string;
  agent: string;
  parentIntent: string | null;
  budget: bigint;
  remainingBudget: bigint;
  expiresAt: bigint;
  nonce: bigint;
  policyVersion: number;
  createdAt: bigint;
  revoked: boolean;
  depth: number;
  goalPredicate: {
    flags: number;
    priceToken: string;
    priceThresholdUsdMicros: bigint;
    priceOracle: string;
    allowedDexes: string[];
    timeStartTs: bigint;
    timeEndTs: bigint;
  };
  children: IntentNode[];
};

function makeReadOnlyProvider(connection: Connection): anchor.AnchorProvider {
  return new anchor.AnchorProvider(connection, {} as anchor.Wallet, {
    commitment: "confirmed",
  });
}

function getProgram(connection: Connection): anchor.Program {
  return new anchor.Program(idl, makeReadOnlyProvider(connection));
}

function decodeIntent(acc: Record<string, unknown>): Omit<IntentNode, "children"> {
  const pred = acc["goalPredicate"] as Record<string, unknown>;
  return {
    pda: "",
    user: (acc["user"] as PublicKey).toBase58(),
    agent: (acc["agent"] as PublicKey).toBase58(),
    parentIntent: acc["parentIntent"]
      ? (acc["parentIntent"] as PublicKey).toBase58()
      : null,
    budget: BigInt((acc["budget"] as anchor.BN).toString()),
    remainingBudget: BigInt((acc["remainingBudget"] as anchor.BN).toString()),
    expiresAt: BigInt((acc["expiresAt"] as anchor.BN).toString()),
    nonce: BigInt((acc["nonce"] as anchor.BN).toString()),
    policyVersion: acc["policyVersion"] as number,
    createdAt: BigInt((acc["createdAt"] as anchor.BN).toString()),
    revoked: acc["revoked"] as boolean,
    depth: acc["depth"] as number,
    goalPredicate: {
      flags: pred["flags"] as number,
      priceToken: (pred["priceToken"] as PublicKey).toBase58(),
      priceThresholdUsdMicros: BigInt(
        (pred["priceThresholdUsdMicros"] as anchor.BN).toString()
      ),
      priceOracle: (pred["priceOracle"] as PublicKey).toBase58(),
      allowedDexes: (pred["allowedDexes"] as PublicKey[]).map((p) => p.toBase58()),
      timeStartTs: BigInt((pred["timeStartTs"] as anchor.BN).toString()),
      timeEndTs: BigInt((pred["timeEndTs"] as anchor.BN).toString()),
    },
  };
}

export async function fetchIntent(
  connection: Connection,
  pda: PublicKey
): Promise<Omit<IntentNode, "children"> | null> {
  const program = getProgram(connection);
  try {
    const accounts = program.account as Record<string, { fetch: (k: PublicKey) => Promise<Record<string, unknown>> }>;
    const intentAcc = accounts["intent"];
    if (!intentAcc) return null;
    const raw = await intentAcc.fetch(pda);
    const decoded = decodeIntent(raw);
    decoded.pda = pda.toBase58();
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Walk parent chain upward from `start`. Returns chain ordered leaf → root.
 */
export async function fetchAncestors(
  connection: Connection,
  start: PublicKey
): Promise<Omit<IntentNode, "children">[]> {
  const chain: Omit<IntentNode, "children">[] = [];
  let cursor: PublicKey | null = start;
  let safety = 16;
  while (cursor && safety-- > 0) {
    const node = await fetchIntent(connection, cursor);
    if (!node) break;
    chain.push(node);
    cursor = node.parentIntent ? new PublicKey(node.parentIntent) : null;
  }
  return chain;
}

/**
 * Find direct children of `parent` via getProgramAccounts memcmp.
 * Intent layout offset of parent_intent option discriminator: 8 (disc) + 32 (user) + 32 (agent) = 72
 */
export async function fetchChildren(
  connection: Connection,
  parent: PublicKey
): Promise<Omit<IntentNode, "children">[]> {
  const program = getProgram(connection);
  // memcmp: option discriminator 0x01 followed by parent pubkey bytes (33 bytes total)
  const bytes = Buffer.concat([
    Buffer.from([1]),
    parent.toBuffer(),
  ]);
  try {
    const accounts = program.account as Record<string, {
      all: (filters: { memcmp: { offset: number; bytes: string } }[]) => Promise<{ publicKey: PublicKey; account: Record<string, unknown> }[]>
    }>;
    const intentAcc = accounts["intent"];
    if (!intentAcc) return [];
    const list = await intentAcc.all([
      { memcmp: { offset: 72, bytes: bs58Encode(bytes) } },
    ]);
    return list.map((x) => {
      const node = decodeIntent(x.account);
      node.pda = x.publicKey.toBase58();
      return node;
    });
  } catch (e) {
    console.error("fetchChildren failed:", e);
    return [];
  }
}

/**
 * Build a full tree rooted at `root`. BFS down to maxDepth.
 */
export async function buildTree(
  connection: Connection,
  root: PublicKey,
  maxDepth = 4
): Promise<IntentNode | null> {
  const node = await fetchIntent(connection, root);
  if (!node) return null;
  const tree: IntentNode = { ...node, children: [] };
  await populateChildren(connection, tree, maxDepth);
  return tree;
}

async function populateChildren(
  connection: Connection,
  node: IntentNode,
  remaining: number
): Promise<void> {
  if (remaining <= 0) return;
  const kids = await fetchChildren(connection, new PublicKey(node.pda));
  for (const k of kids) {
    const child: IntentNode = { ...k, children: [] };
    node.children.push(child);
    await populateChildren(connection, child, remaining - 1);
  }
  node.children.sort((a, b) => Number(a.nonce - b.nonce));
}

/**
 * Given any node in a tree, walk up to find the root, then build tree.
 */
export async function buildTreeFromAnyNode(
  connection: Connection,
  pda: PublicKey
): Promise<IntentNode | null> {
  const chain = await fetchAncestors(connection, pda);
  if (chain.length === 0) return null;
  const root = chain[chain.length - 1];
  if (!root) return null;
  return buildTree(connection, new PublicKey(root.pda));
}

// minimal base58 encoder for memcmp filter (bs58 is in @solana/web3.js's deps but not exposed)
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bs58Encode(buf: Buffer): string {
  if (buf.length === 0) return "";
  const digits: number[] = [0];
  for (let i = 0; i < buf.length; i++) {
    let carry = buf[i]!;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let leadingZeros = 0;
  for (const b of buf) {
    if (b === 0) leadingZeros++;
    else break;
  }
  return (
    "1".repeat(leadingZeros) +
    digits.reverse().map((d) => ALPHABET[d]).join("")
  );
}

export function makeConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

export function shortAddr(addr: string, head = 4, tail = 4): string {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatUsdcMicros(amount: bigint): string {
  const whole = amount / 1_000_000n;
  const frac = amount % 1_000_000n;
  if (frac === 0n) return `${whole} USDC`;
  const f = frac.toString().padStart(6, "0").replace(/0+$/, "");
  return `${whole}.${f} USDC`;
}

export function predicateSummary(
  p: IntentNode["goalPredicate"]
): string[] {
  const PRED_PRICE = 0b0001;
  const PRED_DEX = 0b0010;
  const PRED_TIME = 0b0100;
  const PRED_READ_ONLY = 0b1000;
  if (p.flags & PRED_READ_ONLY) return ["read-only"];
  const items: string[] = [];
  if (p.flags & PRED_DEX) {
    items.push(`dex = ${p.allowedDexes.length} allow-listed`);
  }
  if (p.flags & PRED_TIME) {
    const start = Number(p.timeStartTs);
    const end = Number(p.timeEndTs);
    items.push(
      `time ${new Date(start * 1000).toUTCString().slice(17, 22)}–${new Date(
        end * 1000
      )
        .toUTCString()
        .slice(17, 22)} UTC`
    );
  }
  if (p.flags & PRED_PRICE) {
    items.push("price-bounded");
  }
  if (items.length === 0) return ["unbounded"];
  return items;
}
