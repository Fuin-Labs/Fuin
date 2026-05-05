import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export function deriveIntentPda(
  programId: PublicKey,
  user: PublicKey,
  agent: PublicKey,
  nonce: BN | bigint | number
): [PublicKey, number] {
  const nonceBN =
    nonce instanceof BN
      ? nonce
      : new BN((nonce as bigint | number).toString());
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("intent"),
      user.toBuffer(),
      agent.toBuffer(),
      nonceBN.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
}
