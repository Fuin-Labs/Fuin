"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FuinClient, findVaultPda } from "@fuin/sdk";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet(); // Note: anchor.Wallet interface is slightly different from useWallet
  
  // State
  const [client, setClient] = useState<FuinClient | null>(null);
  const [vaultAddress, setVaultAddress] = useState<PublicKey | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Forms
  const [dailyLimit, setDailyLimit] = useState("10"); // SOL
  const [agentKey, setAgentKey] = useState("");

  // 1. Initialize SDK when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
        // We need to cast the React Context wallet to an Anchor Wallet
        // This is a known boilerplate in Solana Frontends
        const providerWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        } as any;

        const fuin = new FuinClient(connection, providerWallet);
        setClient(fuin);

        // Check if vault exists (Deterministic PDA)
        // Hardcoding nonce=1 for demo simplicity. In prod, you'd fetch all or store nonce off-chain.
        const [pda] = findVaultPda(wallet.publicKey, new BN(1));
        setVaultAddress(pda);
        
        // Try to fetch account
        fetchVault(fuin, pda);
    }
  }, [wallet.connected, wallet.publicKey]);

  const fetchVault = async (sdk: FuinClient, pda: PublicKey) => {
    try {
        const account = await sdk.program.account.vault.fetch(pda);
        setVaultData(account);
    } catch (e) {
        console.log("Vault not found (User needs to init)");
        setVaultData(null);
    }
  };

  // --- ACTIONS ---

  const handleInitVault = async () => {
    if (!client) return;
    setLoading(true);
    try {
        await client.createVault(1, Number(dailyLimit));
        alert("Vault Initialized!");
        await fetchVault(client, vaultAddress!);
    } catch (e) {
        console.error(e);
        alert("Failed: " + e);
    }
    setLoading(false);
  };

  const handleIssueSession = async () => {
    if (!client || !vaultData) return;
    setLoading(true);
    try {
        // Random nonce for session
        const sessionNonce = Math.floor(Math.random() * 100000);
        const agentPubkey = new PublicKey(agentKey);
        
        const { session } = await client.issueSession(
            1, // Vault Nonce
            sessionNonce,
            agentPubkey,
            60 * 60 * 24, // 24 Hours
            1 // 1 SOL limit for agent
        );
        alert(`Session Issued! Address: ${session.toBase58()}`);
    } catch (e) {
        console.error(e);
        alert("Failed to issue session");
    }
    setLoading(false);
  };

  // --- RENDER ---

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-10">
        <p className="text-2xl font-bold">FUIN GUARDIAN</p>
        <WalletMultiButton />
      </div>

      {!wallet.connected && (
        <div className="text-center mt-20">
            <h2 className="text-xl">Connect your wallet to manage your AI Agents.</h2>
        </div>
      )}

      {wallet.connected && !vaultData && (
        <div className="border border-gray-700 p-10 rounded-xl bg-gray-800">
            <h2 className="text-2xl mb-4">Initialize Authorization Vault</h2>
            <p className="mb-6 text-gray-400">You don't have a vault yet. Create one to start.</p>
            
            <label className="block mb-2">Daily Limit (SOL)</label>
            <input 
                type="number" 
                value={dailyLimit} 
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
            />
            
            <button 
                onClick={handleInitVault}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold"
            >
                {loading ? "Creating..." : "Create Vault"}
            </button>
        </div>
      )}

      {wallet.connected && vaultData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {/* Status Card */}
            <div className="border border-green-800 p-6 rounded-xl bg-gray-800">
                <h3 className="text-xl font-bold text-green-400 mb-4">Vault Active</h3>
                <div className="space-y-2">
                    <p><span className="text-gray-500">Guardian:</span> {vaultData.guardian.toBase58().slice(0, 6)}...</p>
                    <p><span className="text-gray-500">Daily Limit:</span> {(vaultData.dailyLimit.toString() / LAMPORTS_PER_SOL)} SOL</p>
                    <p><span className="text-gray-500">Spent Today:</span> {(vaultData.dailySpent.toString() / LAMPORTS_PER_SOL)} SOL</p>
                    <p><span className="text-gray-500">Vault Address:</span> {vaultAddress?.toBase58()}</p>
                </div>
            </div>

            {/* Action Card */}
            <div className="border border-gray-700 p-6 rounded-xl bg-gray-800">
                <h3 className="text-xl font-bold mb-4">Authorize AI Agent</h3>
                
                <label className="block mb-2 text-sm">Agent Public Key</label>
                <input 
                    type="text" 
                    placeholder="Pubkey of the bot..."
                    value={agentKey}
                    onChange={(e) => setAgentKey(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-700 rounded text-white text-sm"
                />

                <button 
                    onClick={handleIssueSession}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded font-bold"
                >
                    {loading ? "Issuing..." : "Issue Session Key"}
                </button>
            </div>
        </div>
      )}
    </main>
  );
}