import { prisma } from "./index";
import type { Prisma } from "@prisma/client";

export type AuditAction = "created" | "paused" | "resumed" | "revoked";

export async function logDelegateAction(params: {
  delegatePda: string;
  vaultPda: string;
  guardian: string;
  action: AuditAction;
  txSignature?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      delegatePda: params.delegatePda,
      vaultPda: params.vaultPda,
      guardian: params.guardian,
      action: params.action,
      txSignature: params.txSignature ?? null,
      metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}

export async function getAuditLogsByVault(vaultPda: string) {
  return prisma.auditLog.findMany({
    where: { vaultPda },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAuditLogsByDelegate(delegatePda: string) {
  return prisma.auditLog.findMany({
    where: { delegatePda },
    orderBy: { createdAt: "desc" },
  });
}
