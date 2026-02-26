"use server";

import { logDelegateAction, getAuditLogsByVault, type AuditAction } from "@fuin/db";

export async function logDelegateControlAction(params: {
  delegatePda: string;
  vaultPda: string;
  guardian: string;
  action: AuditAction;
  txSignature?: string;
  metadata?: Record<string, unknown>;
}) {
  await logDelegateAction(params);
}

export async function fetchAuditLogsByVault(vaultPda: string) {
  const logs = await getAuditLogsByVault(vaultPda);
  return logs.map((log) => ({
    id: log.id,
    delegatePda: log.delegatePda,
    vaultPda: log.vaultPda,
    guardian: log.guardian,
    action: log.action,
    txSignature: log.txSignature,
    metadata: log.metadata as Record<string, unknown> | null,
    createdAt: log.createdAt.toISOString(),
  }));
}
