import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { FuinClient } from "@fuinlabs/sdk";
import * as anchor from "@coral-xyz/anchor";

// In a real app, the bot reads its private key from a secure enclave or .env
// For testing, generate a new keypair or paste the secret key array here.
const AGENT_KEYPAIR = Keypair.generate(); 
const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed");

// The Guardian's public key (the owner of the vault)
const GUARDIAN_PUBKEY = new PublicKey("YOUR_GUARDIAN_WALLET_PUBKEY_HERE"); 

// The destination where the bot wants to send funds
const DESTINATION = new PublicKey("SomeRandomAddressHere..."); 

async function main() {
    console.log("🤖 AI Agent Booting Up...");
    console.log(`🔑 Agent Pubkey: ${AGENT_KEYPAIR.publicKey.toBase58()}`);

    // 1. Initialize the SDK with the Agent's credentials
    // The Agent only acts as a "Signer", so we create a dummy Anchor Wallet wrapper
    const agentWallet = new anchor.Wallet(AGENT_KEYPAIR);
    const client = new FuinClient(CONNECTION, agentWallet);

    try {
        console.log("🚀 Attempting to execute transfer...");
        
        // 2. Execute the Transfer
        // Parameters: Guardian Pubkey, Vault Nonce, Session Nonce, Dest, Amount, Signer
        const txSig = await client.transferSol(
            GUARDIAN_PUBKEY,
            1, // Vault Nonce (match what you used in Guardian UI)
            1, // Session Nonce (match what you used in Guardian UI)
            DESTINATION,
            0.1, // Amount in SOL
            AGENT_KEYPAIR
        );

        console.log(`✅ Success! Transaction Signature: ${txSig}`);
        console.log(`🔗 https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

    } catch (error: any) {
        console.error("❌ Agent Action Failed!");
        console.error(error.message);
        
        if (error.message.includes("SessionInactive")) {
            console.log("💡 The Guardian has paused or revoked this session.");
        } else if (error.message.includes("DailyLimitExceeded")) {
            console.log("💡 The bot tried to spend more than the Guardian allows!");
        }
    }
}

main();