import "dotenv/config";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { FuinClient } from "@fuin/sdk";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";

// --- Config from environment ---

const DELEGATE_PRIVATE_KEY = process.env.DELEGATE_PRIVATE_KEY;
if (!DELEGATE_PRIVATE_KEY) {
    console.error("Error: DELEGATE_PRIVATE_KEY env var is required (base58-encoded secret key)");
    process.exit(1);
}

const GUARDIAN = process.env.GUARDIAN_PUBKEY;
if (!GUARDIAN) {
    console.error("Error: GUARDIAN_PUBKEY env var is required");
    process.exit(1);
}

const DEST = process.env.DESTINATION_PUBKEY;
if (!DEST) {
    console.error("Error: DESTINATION_PUBKEY env var is required");
    process.exit(1);
}

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const VAULT_NONCE = Number(process.env.VAULT_NONCE || "1");
const DELEGATE_NONCE = Number(process.env.DELEGATE_NONCE || "1");
const AMOUNT_SOL = Number(process.env.AMOUNT_SOL || "0.1");

const AGENT_KEYPAIR = Keypair.fromSecretKey(bs58.decode(DELEGATE_PRIVATE_KEY));
const CONNECTION = new Connection(RPC_URL, "confirmed");
const GUARDIAN_PUBKEY = new PublicKey(GUARDIAN);
const DESTINATION = new PublicKey(DEST);

async function main() {
    console.log("AI Agent Booting Up...");
    console.log(`Agent Pubkey: ${AGENT_KEYPAIR.publicKey.toBase58()}`);
    console.log(`Guardian:     ${GUARDIAN_PUBKEY.toBase58()}`);
    console.log(`Destination:  ${DESTINATION.toBase58()}`);
    console.log(`Vault Nonce:  ${VAULT_NONCE}, Delegate Nonce: ${DELEGATE_NONCE}`);
    console.log(`Amount:       ${AMOUNT_SOL} SOL`);

    const agentWallet = new anchor.Wallet(AGENT_KEYPAIR);
    const client = new FuinClient(CONNECTION, agentWallet);

    try {
        console.log("\nAttempting to execute transfer...");

        const txSig = await client.transferSol(
            GUARDIAN_PUBKEY,
            VAULT_NONCE,
            DELEGATE_NONCE,
            DESTINATION,
            AMOUNT_SOL,
            AGENT_KEYPAIR
        );

        console.log(`\nSuccess! Transaction Signature: ${txSig}`);
        console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

    } catch (error: any) {
        console.error("\nAgent Action Failed!");
        console.error(error.message);

        if (error.message.includes("DelegateInactive")) {
            console.log("The Guardian has paused or revoked this delegate.");
        } else if (error.message.includes("DailyLimitExceeded")) {
            console.log("The bot tried to spend more than the Guardian allows!");
        } else if (error.message.includes("PermissionDenied")) {
            console.log("This delegate does not have transfer permissions.");
        }
    }
}

main();
