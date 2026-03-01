"use server";

import {
  getPendingRequestsByVault,
  updateRequestStatus,
} from "@fuin-labs/db";

export async function fetchPendingRequests(vaultPda: string) {
  return getPendingRequestsByVault(vaultPda);
}

export async function approveRequest(id: string) {
  return updateRequestStatus(id, "approved");
}

export async function rejectRequest(id: string) {
  return updateRequestStatus(id, "rejected");
}
