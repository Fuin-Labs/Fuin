import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Fuin } from "@fuin-labs/sdk-v2";
import type { Idl } from "@coral-xyz/anchor";

class InlineWallet {
  constructor(readonly payer: Keypair) {}
  get publicKey() {
    return this.payer.publicKey;
  }
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof Transaction) tx.partialSign(this.payer);
    return tx;
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    for (const tx of txs) if (tx instanceof Transaction) tx.partialSign(this.payer);
    return txs;
  }
}

export function makeFuin(connection: Connection, payer: Keypair, idl: Idl, programId: PublicKey): Fuin {
  const wallet = new InlineWallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet as unknown as anchor.Wallet, {
    commitment: "confirmed",
  });
  return new Fuin({ provider, idl, programId });
}

export async function fundActors(
  connection: Connection,
  funder: Keypair,
  targets: PublicKey[],
  solPerTarget: number
): Promise<string> {
  const lamports = Math.floor(solPerTarget * LAMPORTS_PER_SOL);
  const tx = new Transaction();
  for (const to of targets) {
    tx.add(SystemProgram.transfer({ fromPubkey: funder.publicKey, toPubkey: to, lamports }));
  }
  return sendAndConfirmTransaction(connection, tx, [funder]);
}
