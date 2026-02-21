import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export const FUIN_PROGRAM_ID = new PublicKey("E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy");

// Permission constants (bitmask)
export const CAN_SWAP = 1;
export const CAN_TRANSFER = 2;
export const CAN_STAKE = 4;
export const CAN_LP = 8;

export const findVaultPda = (guardian: PublicKey, nonce: BN, programId = FUIN_PROGRAM_ID) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
      guardian.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
};

export const findDelegatePda = (vault: PublicKey, nonce: BN, programId = FUIN_PROGRAM_ID) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("delegate"),
      vault.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
};
