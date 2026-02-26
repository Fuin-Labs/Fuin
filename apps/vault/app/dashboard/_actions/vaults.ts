"use server";

import { upsertVault, getVaultsByGuardian, updateVaultLabel, getVaultByPda } from "@fuin/db";

export async function saveVault(params: {
  pda: string;
  guardian: string;
  nonce: number;
  label?: string;
}) {
  await upsertVault(params);
}

export async function fetchVaultsByGuardian(guardian: string) {
  return getVaultsByGuardian(guardian);
}

export async function setVaultLabel(pda: string, label: string) {
  await updateVaultLabel(pda, label);
}

export async function fetchVaultLabelsByGuardian(guardian: string): Promise<Record<string, string>> {
  const vaults = await getVaultsByGuardian(guardian);
  const map: Record<string, string> = {};
  for (const v of vaults) {
    if (v.label) map[v.pda] = v.label;
  }
  return map;
}

export async function fetchVaultLabel(pda: string): Promise<string | null> {
  const vault = await getVaultByPda(pda);
  return vault?.label ?? null;
}
