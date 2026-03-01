import { prisma } from "./index";

export type RequestStatus = "pending" | "approved" | "rejected";

export async function createProgramRequest(params: {
  vaultPda: string;
  delegatePda: string;
  guardian: string;
  programAddress: string;
  reason: string;
}) {
  return prisma.programRequest.create({
    data: {
      vaultPda: params.vaultPda,
      delegatePda: params.delegatePda,
      guardian: params.guardian,
      programAddress: params.programAddress,
      reason: params.reason,
    },
  });
}

export async function getPendingRequestsByVault(vaultPda: string) {
  return prisma.programRequest.findMany({
    where: { vaultPda, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingRequestsByGuardian(guardian: string) {
  return prisma.programRequest.findMany({
    where: { guardian, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRequestStatus(
  id: string,
  status: "approved" | "rejected"
) {
  return prisma.programRequest.update({
    where: { id },
    data: { status },
  });
}
