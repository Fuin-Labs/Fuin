import { prisma } from "./index";

/**
 * Ensure a user record exists for a wallet address.
 * Returns the user (created or existing).
 */
export async function ensureUser(wallet: string) {
  return prisma.user.upsert({
    where: { wallet },
    create: { wallet },
    update: {},
  });
}

export async function getUser(wallet: string) {
  return prisma.user.findUnique({ where: { wallet } });
}
