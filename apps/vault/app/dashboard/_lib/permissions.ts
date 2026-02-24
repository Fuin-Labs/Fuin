import { CAN_SWAP, CAN_TRANSFER, CAN_STAKE, CAN_LP } from "@fuin/sdk";

export const PERMISSION_LIST = [
  { value: CAN_TRANSFER, name: "Transfer", icon: "Send" },
  { value: CAN_SWAP, name: "Swap", icon: "ArrowLeftRight" },
  { value: CAN_STAKE, name: "Stake", icon: "Landmark" },
  { value: CAN_LP, name: "LP", icon: "Droplets" },
] as const;

export function hasPermission(bitmask: number, perm: number): boolean {
  return (bitmask & perm) !== 0;
}

export function parsePermissions(bitmask: number): string[] {
  return PERMISSION_LIST.filter((p) => hasPermission(bitmask, p.value)).map((p) => p.name);
}

export function buildPermissionBitmask(perms: number[]): number {
  return perms.reduce((acc, p) => acc | p, 0);
}
