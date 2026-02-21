import * as anchor from "@coral-xyz/anchor";
import { Program, type Idl, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import idl from "./idl/fuin.json";
import { findDelegatePda, findVaultPda } from "./pda";

// Devnet Pyth Feed for SOL/USD (Hardcoded for now)
export const PYTH_SOL_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
export const PYTH_SOL_FEED_ACCOUNT = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");

export class FuinClient {
  public program: Program;
  public connection: Connection;

  constructor(connection: Connection, wallet: anchor.Wallet) {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(idl as Idl, provider);
    this.connection = connection;
  }

  // --- GUARDIAN ACTIONS ---

  async createVault(nonce: number, dailyCapSol: number, perTxCapSol: number, allowedPrograms: PublicKey[] = []) {
    const bnNonce = new BN(nonce);
    const dailyCap = new BN(dailyCapSol * 1_000_000_000);
    const perTxCap = new BN(perTxCapSol * 1_000_000_000);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const tx = await this.program.methods
      .initVault!(bnNonce, dailyCap, perTxCap, allowedPrograms)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, vault: vaultPda };
  }

  async issueDelegate(
    vaultNonce: number,
    delegateNonce: number,
    agentPubkey: PublicKey,
    permissions: number,
    dailyLimitSol: number,
    maxUses: number,
    validitySeconds: number
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const tx = await this.program.methods
      .issueDelegate!(
        bnVaultNonce,
        bnDelegateNonce,
        agentPubkey,
        permissions,
        new BN(dailyLimitSol * 1_000_000_000),
        maxUses,
        new BN(validitySeconds)
      )
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        delegate: delegatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, delegate: delegatePda };
  }

  // --- AGENT ACTIONS ---

  async transferSol(
    guardian: PublicKey,
    vaultNonce: number,
    delegateNonce: number,
    destination: PublicKey,
    amountSol: number,
    signer: Keypair
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const amount = new BN(amountSol * 1_000_000_000);

    const tx = await this.program.methods
      .executeTransfer!(bnVaultNonce, bnDelegateNonce, amount)
      .accounts({
        relayer: signer.publicKey,
        delegateKey: signer.publicKey,
        guardian: guardian,
        vault: vaultPda,
        delegate: delegatePda,
        destination: destination,
        systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

    return tx;
  }

  async transferSpl(
    guardian: PublicKey,
    vaultNonce: number,
    delegateNonce: number,
    mint: PublicKey,
    destination: PublicKey,
    amountTokens: number,
    signer: Keypair
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const vaultAta = getAssociatedTokenAddressSync(mint, vaultPda, true);
    const destAta = getAssociatedTokenAddressSync(mint, destination, true);

    const tx = await this.program.methods
      .executeSplTransfer!(bnVaultNonce, bnDelegateNonce, new BN(amountTokens), PYTH_SOL_FEED_ID)
      .accounts({
        relayer: signer.publicKey,
        delegateKey: signer.publicKey,
        guardian: guardian,
        vault: vaultPda,
        delegate: delegatePda,
        vaultTokenAccount: vaultAta,
        destinationTokenAccount: destAta,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        priceUpdate: PYTH_SOL_FEED_ACCOUNT,
      })
      .signers([signer])
      .rpc();

    return tx;
  }

  // --- VAULT MANAGEMENT ---

  async freezeVault(nonce: number) {
    const bnNonce = new BN(nonce);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const tx = await this.program.methods
      .freezeVault!(bnNonce)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
      })
      .rpc();

    return tx;
  }

  async unfreezeVault(nonce: number) {
    const bnNonce = new BN(nonce);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const tx = await this.program.methods
      .unfreezeVault!(bnNonce)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
      })
      .rpc();

    return tx;
  }

  async delegateControl(vaultNonce: number, delegateNonce: number, status: number) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const tx = await this.program.methods
      .delegateControl!(bnVaultNonce, bnDelegateNonce, status)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        delegate: delegatePda,
      })
      .rpc();

    return tx;
  }

  async updateVault(nonce: number, newDailyCapSol?: number, newPerTxCapSol?: number) {
    const bnNonce = new BN(nonce);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const newDailyCap = newDailyCapSol !== undefined ? new BN(newDailyCapSol * 1_000_000_000) : null;
    const newPerTxCap = newPerTxCapSol !== undefined ? new BN(newPerTxCapSol * 1_000_000_000) : null;

    const tx = await this.program.methods
      .updateVault!(bnNonce, newDailyCap, newPerTxCap)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
      })
      .rpc();

    return tx;
  }

  async withdraw(nonce: number, amountSol: number) {
    const bnNonce = new BN(nonce);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const tx = await this.program.methods
      .withdraw!(bnNonce, new BN(amountSol * 1_000_000_000))
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }
}
