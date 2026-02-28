import { Connection, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { FuinClient } from "@fuin-labs/sdk";
import bs58 from "bs58";

export interface Config {
  keypair: Keypair;
  connection: Connection;
  client: FuinClient;
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

  const wallet = new anchor.Wallet(keypair);
  const client = new FuinClient(connection, wallet);

  return { keypair, connection, client };
}
