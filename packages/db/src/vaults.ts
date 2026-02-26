import { prisma } from "./index";
import { ensureUser } from "./users";

export async function upsertVault(params: {
  pda: string;
  guardian: string;
  nonce: number;
  label?: string;
}) {
  await ensureUser(params.guardian);
  return prisma.vault.upsert({
    where: { pda: params.pda },
    create: {
      pda: params.pda,
      guardian: params.guardian,
      nonce: params.nonce,
      label: params.label ?? null,
    },
    update: {
      label: params.label ?? undefined,
    },
  });
}

export async function getVaultsByGuardian(guardian: string) {
  return prisma.vault.findMany({
    where: { guardian },
    orderBy: { nonce: "asc" },
    include: { delegates: true },
  });
}

export async function getVaultByPda(pda: string) {
  return prisma.vault.findUnique({
    where: { pda },
    include: { delegates: true },
  });
}

export async function updateVaultLabel(pda: string, label: string) {
  return prisma.vault.update({
    where: { pda },
    data: { label },
  });
}
