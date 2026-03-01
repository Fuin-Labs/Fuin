import "dotenv/config";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { FuinClient, PYTH_SOL_FEED_ID, PYTH_SOL_FEED_ACCOUNT, PYTH_PRICE_FEEDS } from "@fuin-labs/sdk";
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

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const VAULT_NONCE = Number(process.env.VAULT_NONCE || "1");
const DELEGATE_NONCE = Number(process.env.DELEGATE_NONCE || "1");

// Action mode: "sol" (default), "spl", or "swap"
const ACTION = (process.env.ACTION || process.env.TRANSFER_TYPE || "sol").toLowerCase();

// --- Pyth feed resolution ---
const PYTH_FEED = process.env.PYTH_FEED;
const resolvedFeed = PYTH_FEED ? PYTH_PRICE_FEEDS[PYTH_FEED] : undefined;

if (PYTH_FEED && !resolvedFeed && !process.env.PYTH_FEED_ID) {
    console.error(`Error: Unknown PYTH_FEED "${PYTH_FEED}". Available: ${Object.keys(PYTH_PRICE_FEEDS).join(", ")}`);
    process.exit(1);
}

const FEED_ID = process.env.PYTH_FEED_ID || resolvedFeed?.feedId || PYTH_SOL_FEED_ID;
const FEED_ACCOUNT = process.env.PYTH_FEED_ACCOUNT
    ? new PublicKey(process.env.PYTH_FEED_ACCOUNT)
    : resolvedFeed?.priceAccount || PYTH_SOL_FEED_ACCOUNT;

// --- Action-specific config ---
const AMOUNT_SOL = Number(process.env.AMOUNT_SOL || "0.1");
const MINT = process.env.MINT;
const AMOUNT_TOKENS = process.env.AMOUNT_TOKENS ? Number(process.env.AMOUNT_TOKENS) : undefined;

// Swap-specific
const POOL = process.env.POOL;
const INPUT_MINT = process.env.INPUT_MINT;
const AMOUNT_IN = process.env.AMOUNT_IN ? Number(process.env.AMOUNT_IN) : undefined;
const MAX_SLIPPAGE_BPS = Number(process.env.MAX_SLIPPAGE_BPS || "100");

// --- Validation ---
if (ACTION === "spl" || ACTION === "swap") {
    if (!PYTH_FEED && !process.env.PYTH_FEED_ID) {
        console.error("Error: PYTH_FEED or PYTH_FEED_ID env var is required for SPL/swap actions");
        process.exit(1);
    }
}

if (ACTION === "spl") {
    if (!MINT) {
        console.error("Error: MINT env var is required for SPL transfers");
        process.exit(1);
    }
    if (AMOUNT_TOKENS === undefined) {
        console.error("Error: AMOUNT_TOKENS env var is required for SPL transfers");
        process.exit(1);
    }
    if (!process.env.DESTINATION_PUBKEY) {
        console.error("Error: DESTINATION_PUBKEY env var is required for SPL transfers");
        process.exit(1);
    }
}

if (ACTION === "sol") {
    if (!process.env.DESTINATION_PUBKEY) {
        console.error("Error: DESTINATION_PUBKEY env var is required for SOL transfers");
        process.exit(1);
    }
}

if (ACTION === "swap") {
    if (!POOL) {
        console.error("Error: POOL env var is required for swaps (Meteora DLMM pool address)");
        process.exit(1);
    }
    if (!INPUT_MINT) {
        console.error("Error: INPUT_MINT env var is required for swaps");
        process.exit(1);
    }
    if (AMOUNT_IN === undefined) {
        console.error("Error: AMOUNT_IN env var is required for swaps (raw token amount)");
        process.exit(1);
    }
}

const AGENT_KEYPAIR = Keypair.fromSecretKey(bs58.decode(DELEGATE_PRIVATE_KEY));
const CONNECTION = new Connection(RPC_URL, "confirmed");
const GUARDIAN_PUBKEY = new PublicKey(GUARDIAN);

async function main() {
    console.log("AI Agent Booting Up...");
    console.log(`Agent Pubkey: ${AGENT_KEYPAIR.publicKey.toBase58()}`);
    console.log(`Guardian:     ${GUARDIAN_PUBKEY.toBase58()}`);
    console.log(`Vault Nonce:  ${VAULT_NONCE}, Delegate Nonce: ${DELEGATE_NONCE}`);
    console.log(`Action:       ${ACTION.toUpperCase()}`);

    if (ACTION === "sol") {
        console.log(`Destination:  ${process.env.DESTINATION_PUBKEY}`);
        console.log(`Amount:       ${AMOUNT_SOL} SOL`);
    } else if (ACTION === "spl") {
        console.log(`Destination:  ${process.env.DESTINATION_PUBKEY}`);
        console.log(`Mint:         ${MINT}`);
        console.log(`Amount:       ${AMOUNT_TOKENS} tokens`);
        console.log(`Pyth Feed:    ${PYTH_FEED || "SOL/USD (default)"}`);
    } else if (ACTION === "swap") {
        console.log(`Pool:         ${POOL}`);
        console.log(`Input Mint:   ${INPUT_MINT}`);
        console.log(`Amount In:    ${AMOUNT_IN}`);
        console.log(`Max Slippage: ${MAX_SLIPPAGE_BPS} bps`);
        console.log(`Pyth Feed:    ${PYTH_FEED || "SOL/USD (default)"}`);
    }

    const agentWallet = new anchor.Wallet(AGENT_KEYPAIR);
    const client = new FuinClient(CONNECTION, agentWallet);

    try {
        if (ACTION === "sol") {
            console.log("\nExecuting SOL transfer...");
            const destination = new PublicKey(process.env.DESTINATION_PUBKEY!);

            const txSig = await client.transferSol(
                GUARDIAN_PUBKEY,
                VAULT_NONCE,
                DELEGATE_NONCE,
                destination,
                AMOUNT_SOL,
                AGENT_KEYPAIR
            );

            console.log(`\nSuccess! Transaction Signature: ${txSig}`);
            console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

        } else if (ACTION === "spl") {
            console.log("\nExecuting SPL transfer...");
            const destination = new PublicKey(process.env.DESTINATION_PUBKEY!);

            const txSig = await client.transferSpl(
                GUARDIAN_PUBKEY,
                VAULT_NONCE,
                DELEGATE_NONCE,
                new PublicKey(MINT!),
                destination,
                AMOUNT_TOKENS!,
                AGENT_KEYPAIR,
                FEED_ID,
                FEED_ACCOUNT
            );

            console.log(`\nSuccess! Transaction Signature: ${txSig}`);
            console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

        } else if (ACTION === "swap") {
            console.log("\nExecuting swap via Meteora DLMM...");

            const { signature, quote } = await client.swap(
                GUARDIAN_PUBKEY,
                VAULT_NONCE,
                DELEGATE_NONCE,
                new PublicKey(POOL!),
                new PublicKey(INPUT_MINT!),
                AMOUNT_IN!,
                MAX_SLIPPAGE_BPS,
                AGENT_KEYPAIR,
                FEED_ID,
                FEED_ACCOUNT
            );

            console.log(`\nSuccess! Transaction Signature: ${signature}`);
            console.log(`Min output: ${quote.minOutAmount.toString()}`);
            console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        } else {
            console.error(`Unknown ACTION: "${ACTION}". Use "sol", "spl", or "swap".`);
            process.exit(1);
        }

    } catch (error: any) {
        console.error("\nAgent Action Failed!");
        console.error(error.message);

        if (error.message.includes("DelegateInactive")) {
            console.log("The Guardian has paused or revoked this delegate.");
        } else if (error.message.includes("DailyLimitExceeded")) {
            console.log("The bot tried to spend more than the Guardian allows!");
        } else if (error.message.includes("PermissionDenied")) {
            console.log("This delegate does not have the required permission.");
        } else if (error.message.includes("AccountNotFound")) {
            console.log("Token account not found. Ensure the vault has an ATA for this mint.");
        } else if (error.message.includes("InsufficientFunds")) {
            console.log("Insufficient balance in the vault.");
        } else if (error.message.includes("SlippageExceeded")) {
            console.log("Swap slippage exceeded. Try increasing MAX_SLIPPAGE_BPS.");
        }
    }
}

main();
