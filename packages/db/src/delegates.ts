import { prisma } from "./index";
import { ensureUser } from "./users";

export async function setDelegateLabel(params: {
  delegatePda: string;
  vaultPda: string;
  guardian: string;
  label: string;
  kind: "kid" | "openclaw";
}) {
  await ensureUser(params.guardian);
  // Ensure vault exists in DB (create a minimal record if not)
  await prisma.vault.upsert({
    where: { pda: params.vaultPda },
    create: {
      pda: params.vaultPda,
      guardian: params.guardian,
      nonce: 0, // will be updated when vault detail is loaded
    },
    update: {},
  });

  return prisma.delegateLabel.upsert({
    where: { delegatePda: params.delegatePda },
    create: {
      delegatePda: params.delegatePda,
      vaultPda: params.vaultPda,
      guardian: params.guardian,
      label: params.label,
      kind: params.kind,
    },
    update: {
      label: params.label,
      kind: params.kind,
    },
  });
}

export async function getDelegateLabel(delegatePda: string) {
  const record = await prisma.delegateLabel.findUnique({
    where: { delegatePda },
  });
  return record?.label ?? null;
}

export async function getDelegateLabels(delegatePdas: string[]) {
  if (delegatePdas.length === 0) return {};
  const records = await prisma.delegateLabel.findMany({
    where: { delegatePda: { in: delegatePdas } },
  });
  const map: Record<string, string> = {};
  for (const r of records) {
    map[r.delegatePda] = r.label;
  }
  return map;
}

export async function getDelegateLabelsByVault(vaultPda: string) {
  const records = await prisma.delegateLabel.findMany({
    where: { vaultPda },
  });
  const map: Record<string, string> = {};
  for (const r of records) {
    map[r.delegatePda] = r.label;
  }
  return map;
}
