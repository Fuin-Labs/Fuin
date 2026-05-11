import { Connection, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { FuinClient } from "@fuin-labs/sdk";
import bs58 from "bs58";

class NodeWallet {
  constructor(readonly payer: Keypair) {}
  get publicKey() { return this.payer.publicKey; }
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof Transaction) { tx.partialSign(this.payer); }
    return tx;
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    for (const tx of txs) { if (tx instanceof Transaction) tx.partialSign(this.payer); }
    return txs;
  }
}

export interface Config {
  keypair: Keypair;
  connection: Connection;
  client: FuinClient;
  relayerUrl: string;
}

export function loadConfig(): Config {
  const privateKeyStr = process.env.DELEGATE_PRIVATE_KEY;
  if (!privateKeyStr) {
    throw new Error(
      "DELEGATE_PRIVATE_KEY environment variable is required (base58-encoded secret key)"
    );
  }

  let keypair: Keypair;
  try {
    const secretKey = bs58.decode(privateKeyStr);
    keypair = Keypair.fromSecretKey(secretKey);
  } catch {
    throw new Error(
      "DELEGATE_PRIVATE_KEY is not a valid base58-encoded secret key"
    );
  }

  const rpcUrl =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  const wallet = new NodeWallet(keypair);
  const client = new FuinClient(connection, wallet as any);

  const relayerUrl = process.env.FUIN_RELAYER_URL ?? "http://127.0.0.1:8788";

  return { keypair, connection, client, relayerUrl };
}
