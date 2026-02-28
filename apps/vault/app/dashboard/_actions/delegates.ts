"use server";

import {
  setDelegateLabel as dbSetLabel,
  getDelegateLabel as dbGetLabel,
  getDelegateLabels as dbGetLabels,
  getDelegateLabelsByVault as dbGetLabelsByVault,
} from "@fuin-labs/db";

export async function saveDelegateLabel(params: {
  delegatePda: string;
  vaultPda: string;
  guardian: string;
  label: string;
  kind: "kid" | "openclaw";
}) {
  await dbSetLabel(params);
}

export async function fetchDelegateLabel(delegatePda: string): Promise<string | null> {
  return dbGetLabel(delegatePda);
}

export async function fetchDelegateLabels(delegatePdas: string[]): Promise<Record<string, string>> {
  return dbGetLabels(delegatePdas);
}

export async function fetchDelegateLabelsByVault(vaultPda: string): Promise<Record<string, string>> {
  return dbGetLabelsByVault(vaultPda);
}
