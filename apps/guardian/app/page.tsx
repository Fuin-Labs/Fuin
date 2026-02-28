"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FuinClient, findVaultPda, CAN_SWAP, CAN_TRANSFER, CAN_STAKE, CAN_LP } from "@fuin/sdk";
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // State
  const [client, setClient] = useState<FuinClient | null>(null);
  const [vaultAddress, setVaultAddress] = useState<PublicKey | null>(null);
  const [vaultData, setVaultData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Vault nonce
  const [vaultNonce, setVaultNonce] = useState(1);

  // Vault init forms
  const [dailyCap, setDailyCap] = useState("10");
  const [perTxCap, setPerTxCap] = useState("1");

  // Delegate forms
  const [agentKey, setAgentKey] = useState("");
  const [delegateDailyLimit, setDelegateDailyLimit] = useState("1");
  const [delegateMaxUses, setDelegateMaxUses] = useState("0");
  const [delegateValidity, setDelegateValidity] = useState("86400");
  const [permissions, setPermissions] = useState<number>(CAN_TRANSFER);

  // 1. Initialize SDK when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
        const providerWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        } as any;

        const fuin = new FuinClient(connection, providerWallet);
        setClient(fuin);

        const [pda] = findVaultPda(wallet.publicKey, new BN(vaultNonce));
        setVaultAddress(pda);

        fetchVault(fuin, pda);
    }
  }, [wallet.connected, wallet.publicKey, vaultNonce]);

  const fetchVault = async (sdk: FuinClient, pda: PublicKey) => {
    try {
        const account = await (sdk.program.account as any).vault.fetch(pda);
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
        await client.createVault(vaultNonce, Number(dailyCap), Number(perTxCap), []);
        alert("Vault Initialized!");
        await fetchVault(client, vaultAddress!);
    } catch (e) {
        console.error(e);
        alert("Failed: " + e);
    }
    setLoading(false);
  };

  const handleIssueDelegate = async () => {
    if (!client || !vaultData) return;
    setLoading(true);
    try {
        const delegateNonce = Math.floor(Math.random() * 100000);
        const agentPubkey = new PublicKey(agentKey);

        const { delegate } = await client.issueDelegate(
            vaultNonce,
            delegateNonce,
            agentPubkey,
            permissions,
            Number(delegateDailyLimit),
            Number(delegateMaxUses),
            Number(delegateValidity)
        );
        alert(`Delegate Issued! Address: ${delegate.toBase58()}`);
    } catch (e) {
        console.error(e);
        alert("Failed to issue delegate");
    }
    setLoading(false);
  };

  const handleDeposit = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !vaultAddress) return;
    setLoading(true);
    try {
        const amount = 1 * LAMPORTS_PER_SOL;

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: vaultAddress,
                lamports: amount,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = wallet.publicKey;

        const signedTx = await wallet.signTransaction(tx);
        const txId = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txId);

        alert(`Deposited 1 SOL to Vault!`);
        await fetchVault(client!, vaultAddress);
    } catch (e) {
        console.error(e);
        alert("Deposit failed");
    }
    setLoading(false);
  };

  const handleFreeze = async () => {
    if (!client) return;
    setLoading(true);
    try {
        await client.freezeVault(vaultNonce);
        alert("Vault Frozen!");
        await fetchVault(client, vaultAddress!);
    } catch (e) {
        console.error(e);
        alert("Freeze failed: " + e);
    }
    setLoading(false);
  };

  const handleUnfreeze = async () => {
    if (!client) return;
    setLoading(true);
    try {
        await client.unfreezeVault(vaultNonce);
        alert("Vault Unfrozen!");
        await fetchVault(client, vaultAddress!);
    } catch (e) {
        console.error(e);
        alert("Unfreeze failed: " + e);
    }
    setLoading(false);
  };

  const togglePermission = (perm: number) => {
    setPermissions((prev) => prev ^ perm);
  };

  const getVaultStateLabel = () => {
    if (!vaultData) return "";
    if (vaultData.state.active !== undefined) return "Active";
    if (vaultData.state.frozen !== undefined) return "Frozen";
    if (vaultData.state.draining !== undefined) return "Draining";
    return "Unknown";
  };

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

            <label className="block mb-2">Vault Nonce</label>
            <input
                type="number"
                value={vaultNonce}
                onChange={(e) => setVaultNonce(Number(e.target.value))}
                className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                min={1}
            />

            <label className="block mb-2">Daily Cap (SOL)</label>
            <input
                type="number"
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
            />

            <label className="block mb-2">Per-Transaction Cap (SOL)</label>
            <input
                type="number"
                value={perTxCap}
                onChange={(e) => setPerTxCap(e.target.value)}
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
        <div className="w-full max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-gray-400">Vault Nonce:</label>
            <input
              type="number"
              value={vaultNonce}
              onChange={(e) => setVaultNonce(Number(e.target.value))}
              className="w-24 p-2 bg-gray-700 rounded text-white text-sm"
              min={1}
            />
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Status Card */}
            <div className="border border-green-800 p-6 rounded-xl bg-gray-800">
                <h3 className="text-xl font-bold text-green-400 mb-4">
                    Vault {getVaultStateLabel()}
                </h3>
                <div className="space-y-2">
                    <p><span className="text-gray-500">Guardian:</span> {vaultData.guardian.toBase58().slice(0, 6)}...</p>
                    <p><span className="text-gray-500">Daily Cap:</span> {(vaultData.policies.spending.dailyCap.toString() / LAMPORTS_PER_SOL)} SOL</p>
                    <p><span className="text-gray-500">Per-Tx Cap:</span> {(vaultData.policies.spending.perTxCap.toString() / LAMPORTS_PER_SOL)} SOL</p>
                    <p><span className="text-gray-500">Spent Today:</span> {(vaultData.policies.spending.dailySpent.toString() / LAMPORTS_PER_SOL)} SOL</p>
                    <p><span className="text-gray-500">Vault Address:</span> {vaultAddress?.toBase58()}</p>
                </div>

                <div className="mt-4 flex gap-2">
                    {vaultData.state.active !== undefined ? (
                        <button
                            onClick={handleFreeze}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-sm"
                        >
                            Freeze Vault
                        </button>
                    ) : (
                        <button
                            onClick={handleUnfreeze}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold text-sm"
                        >
                            Unfreeze Vault
                        </button>
                    )}
                </div>
            </div>

            {/* Delegate Card */}
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

                <label className="block mb-2 text-sm">Permissions</label>
                <div className="flex gap-3 mb-4 flex-wrap">
                    {[
                        { label: "Transfer", value: CAN_TRANSFER },
                        { label: "Swap", value: CAN_SWAP },
                        { label: "Stake", value: CAN_STAKE },
                        { label: "LP", value: CAN_LP },
                    ].map((p) => (
                        <label key={p.value} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={(permissions & p.value) !== 0}
                                onChange={() => togglePermission(p.value)}
                            />
                            {p.label}
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                        <label className="block mb-1 text-xs text-gray-400">Daily Limit (SOL)</label>
                        <input
                            type="number"
                            value={delegateDailyLimit}
                            onChange={(e) => setDelegateDailyLimit(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs text-gray-400">Max Uses (0=unlimited)</label>
                        <input
                            type="number"
                            value={delegateMaxUses}
                            onChange={(e) => setDelegateMaxUses(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs text-gray-400">Validity (seconds)</label>
                        <input
                            type="number"
                            value={delegateValidity}
                            onChange={(e) => setDelegateValidity(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded text-white text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={handleIssueDelegate}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded font-bold"
                >
                    {loading ? "Issuing..." : "Issue Delegate Key"}
                </button>

                <button
                  onClick={handleDeposit}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 p-3 rounded font-bold mt-4"
              >
                  {loading ? "Processing..." : "Deposit 1 SOL to Vault"}
              </button>
            </div>
        </div>
        </div>
      )}
    </main>
  );
}
