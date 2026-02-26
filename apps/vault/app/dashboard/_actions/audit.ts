"use server";

import { logDelegateAction, type AuditAction } from "@fuin/db";

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
