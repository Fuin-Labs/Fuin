import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export interface RelayerConfig {
  connection: Connection;
  funder: Keypair;
  programId: PublicKey;
  host: string;
  port: number;
  stateFile: string;
}

export function loadConfig(): RelayerConfig {
  const sk = process.env.RELAYER_FUNDER_PRIVATE_KEY;
  if (!sk) {
    throw new Error("RELAYER_FUNDER_PRIVATE_KEY env var is required (base58)");
  }
  let funder: Keypair;
  try {
    funder = Keypair.fromSecretKey(bs58.decode(sk));
  } catch (e) {
    throw new Error("RELAYER_FUNDER_PRIVATE_KEY is not valid base58");
  }
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const programId = new PublicKey(
    process.env.FUIN_V2_PROGRAM_ID ?? "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy"
  );
  return {
    connection: new Connection(rpcUrl, "confirmed"),
    funder,
    programId,
    host: process.env.RELAYER_HOST ?? "127.0.0.1",
    port: Number(process.env.RELAYER_PORT ?? 8788),
    stateFile: new URL("../.swarm-state.json", import.meta.url).pathname,
  };
}
