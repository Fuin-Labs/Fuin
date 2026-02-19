import * as anchor from "@coral-xyz/anchor";
import { Program, type Idl, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import idl from "./idl/fuin.json";
import { findSessionPda, findVaultPda } from "./pda";

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

  async createVault(nonce: number, dailyLimitSol: number) {
    const bnNonce = new BN(nonce);
    const limit = new BN(dailyLimitSol * 1_000_000_000); 
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const tx = await this.program.methods
      .initVault!(bnNonce, limit, [])
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return { signature: tx, vault: vaultPda };
  }

  async issueSession(
    vaultNonce: number,
    sessionNonce: number,
    agentPubkey: PublicKey,
    validitySeconds: number,
    limitSol: number
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnSessionNonce = new BN(sessionNonce);
    
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnVaultNonce, this.program.programId);
    const [sessionPda] = findSessionPda(this.program.provider.publicKey!, vaultPda, bnSessionNonce, this.program.programId);

    const tx = await this.program.methods
      .issueSession!(bnSessionNonce, agentPubkey, new BN(validitySeconds), new BN(limitSol * 1_000_000_000), null)
      .accounts({
        guardian: this.program.provider.publicKey!,
        vault: vaultPda,
        session: sessionPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, session: sessionPda };
  }

  // --- AGENT ACTIONS ---

  async transferSol(
    guardian: PublicKey,
    vaultNonce: number,
    sessionNonce: number,
    destination: PublicKey,
    amountSol: number,
    signer: Keypair // Agent Keypair
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnSessionNonce = new BN(sessionNonce);
    
    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [sessionPda] = findSessionPda(guardian, vaultPda, bnSessionNonce, this.program.programId);
    
    const amount = new BN(amountSol * 1_000_000_000);

    const tx = await this.program.methods
      .executeTransfer!(bnVaultNonce, bnSessionNonce, amount)
      .accounts({
        relayer: signer.publicKey,
        sessionKey: signer.publicKey,
        guardian: guardian,
        vault: vaultPda,
        session: sessionPda,
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
    sessionNonce: number,
    mint: PublicKey,
    destination: PublicKey,
    amountTokens: number,
    signer: Keypair
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnSessionNonce = new BN(sessionNonce);
    
    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [sessionPda] = findSessionPda(guardian, vaultPda, bnSessionNonce, this.program.programId);

    const vaultAta = getAssociatedTokenAddressSync(mint, vaultPda, true);
    const destAta = getAssociatedTokenAddressSync(mint, destination, true);

    const tx = await this.program.methods
      .executeSplTransfer!(bnVaultNonce, bnSessionNonce, new BN(amountTokens), PYTH_SOL_FEED_ID)
      .accounts({
        relayer: signer.publicKey,
        sessionKey: signer.publicKey,
        guardian: guardian,
        vault: vaultPda,
        session: sessionPda,
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
}