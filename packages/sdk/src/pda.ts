import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export const FUIN_PROGRAM_ID = new PublicKey("E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy");

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

export const findSessionPda = (guardian: PublicKey, vault: PublicKey, nonce: BN, programId = FUIN_PROGRAM_ID) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("session"),
      guardian.toBuffer(),
      vault.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
};