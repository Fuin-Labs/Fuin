import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type BN from "bn.js";

export function formatSol(lamports: BN | number | string): string {
  const num = typeof lamports === "string" ? Number(lamports) : typeof lamports === "number" ? lamports : lamports.toNumber();
  return (num / LAMPORTS_PER_SOL).toFixed(4);
}

export function formatSolShort(lamports: BN | number | string): string {
  const num = typeof lamports === "string" ? Number(lamports) : typeof lamports === "number" ? lamports : lamports.toNumber();
  const sol = num / LAMPORTS_PER_SOL;
  if (sol >= 1000) return `${(sol / 1000).toFixed(1)}k`;
  if (sol >= 1) return sol.toFixed(2);
  return sol.toFixed(4);
}

export function formatAddress(pubkey: PublicKey | string): string {
  const str = typeof pubkey === "string" ? pubkey : pubkey.toBase58();
  if (str.length <= 10) return str;
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export function formatTimestamp(unixSeconds: number): string {
  const now = Date.now() / 1000;
  const diff = unixSeconds - now;

  if (diff <= 0) {
    const ago = Math.abs(diff);
    if (ago < 60) return "just now";
    if (ago < 3600) return `${Math.floor(ago / 60)}m ago`;
    if (ago < 86400) return `${Math.floor(ago / 3600)}h ago`;
    return `${Math.floor(ago / 86400)}d ago`;
  }

  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return `in ${Math.floor(diff / 86400)}d`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} days`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function getVaultState(state: Record<string, unknown>): "active" | "frozen" | "draining" {
  if ("active" in state) return "active";
  if ("frozen" in state) return "frozen";
  if ("draining" in state) return "draining";
  return "active";
}
