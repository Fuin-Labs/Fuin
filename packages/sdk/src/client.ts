import * as anchor from "@coral-xyz/anchor";
import { Program, type Idl, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair, ComputeBudgetProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import idl from "./idl/fuin.json";
import { findDelegatePda, findVaultPda, METEORA_DLMM_PROGRAM } from "./pda";

// Devnet Pyth Feed for SOL/USD (Hardcoded for now)
export const PYTH_SOL_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
export const PYTH_SOL_FEED_ACCOUNT = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");

export interface PythFeedConfig {
  feedId: string;
  priceAccount: PublicKey;
}

/**
 * Pyth price feed mapping. Feed IDs are universal across chains.
 * Price accounts are shard-0 PDAs from the Pyth Push Oracle program
 * (pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT), same on mainnet and devnet.
 */
export const PYTH_PRICE_FEEDS: Record<string, PythFeedConfig> = {
  "SOL/USD": {
    feedId: PYTH_SOL_FEED_ID,
    priceAccount: PYTH_SOL_FEED_ACCOUNT,
  },
  "BTC/USD": {
    feedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    priceAccount: new PublicKey("4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo"),
  },
  "ETH/USD": {
    feedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    priceAccount: new PublicKey("42amVS4KgzR9rA28tkVYqVXjq9Qa8dcZQMbH5EYFX6XC"),
  },
  "USDC/USD": {
    feedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    priceAccount: new PublicKey("Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"),
  },
  "USDT/USD": {
    feedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
    priceAccount: new PublicKey("HT2PLQBcG5EiCcNSaMHAjSgd9F98ecpATbk4Sk5oYuM"),
  },
  "BONK/USD": {
    feedId: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
    priceAccount: new PublicKey("DBE3N8uNjhKPRHfANdwGvCZghWXyLPdqdSbEW2XFwBiX"),
  },
  "JUP/USD": {
    feedId: "0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996",
    priceAccount: new PublicKey("7dbob1psH1iZBS7qPsm3Kwbf5DzSXK8Jyg31CTgTnxH5"),
  },
  "RAY/USD": {
    feedId: "0x91568baa8beb53db23eb3fb7f22c6e8bd303d103919e19733f2bb642d3e7987a",
    priceAccount: new PublicKey("Hhipna3EoWR7u8pDruUg8RxhP5F6XLh6SEHMVDmZhWi8"),
  },
  "WIF/USD": {
    feedId: "0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc",
    priceAccount: new PublicKey("6B23K3tkb51vLZA14jcEQVCA1pfHptzEHFA93V5dYwbT"),
  },
};

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

  async transferSolWallet(
    guardian: PublicKey,
    vaultNonce: number,
    delegateNonce: number,
    destination: PublicKey,
    amountSol: number
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const amount = new BN(amountSol * 1_000_000_000);
    const walletKey = this.program.provider.publicKey!;

    const tx = await this.program.methods
      .executeTransfer!(bnVaultNonce, bnDelegateNonce, amount)
      .accounts({
        relayer: walletKey,
        delegateKey: walletKey,
        guardian: guardian,
        vault: vaultPda,
        delegate: delegatePda,
        destination: destination,
        systemProgram: SystemProgram.programId,
      })
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
    signer: Keypair,
    feedId: string = PYTH_SOL_FEED_ID,
    feedAccount: PublicKey = PYTH_SOL_FEED_ACCOUNT
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    const vaultAta = getAssociatedTokenAddressSync(mint, vaultPda, true);
    const destAta = getAssociatedTokenAddressSync(mint, destination, true);

    const createDestAtaIx = createAssociatedTokenAccountIdempotentInstruction(
      signer.publicKey,  // payer
      destAta,
      destination,
      mint,
    );

    const tx = await this.program.methods
      .executeSplTransfer!(bnVaultNonce, bnDelegateNonce, new BN(amountTokens), feedId)
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
        priceUpdate: feedAccount,
      })
      .preInstructions([createDestAtaIx])
      .signers([signer])
      .rpc();

    return tx;
  }

  // --- SWAP ---

  async swap(
    guardian: PublicKey,
    vaultNonce: number,
    delegateNonce: number,
    poolAddress: PublicKey,
    inputMint: PublicKey,
    amountIn: number,
    maxSlippageBps: number,
    signer: Keypair,
    feedId: string,
    feedAccount: PublicKey,
  ) {
    const bnVaultNonce = new BN(vaultNonce);
    const bnDelegateNonce = new BN(delegateNonce);

    const [vaultPda] = findVaultPda(guardian, bnVaultNonce, this.program.programId);
    const [delegatePda] = findDelegatePda(vaultPda, bnDelegateNonce, this.program.programId);

    // Lazy-load DLMM to avoid ESM compat issues crashing the whole process
    const { default: DLMM } = await import("@meteora-ag/dlmm");
    const dlmmPool = await DLMM.create(this.connection, poolAddress);
    const swapForY = dlmmPool.lbPair.tokenXMint.equals(inputMint);

    // Get bin arrays and quote
    const bnAmountIn = new BN(amountIn);
    const binArrays = await dlmmPool.getBinArrayForSwap(swapForY);
    const swapQuote = dlmmPool.swapQuote(bnAmountIn, swapForY, new BN(maxSlippageBps), binArrays);

    // Derive vault ATAs
    const outputMint = swapForY
      ? dlmmPool.lbPair.tokenYMint
      : dlmmPool.lbPair.tokenXMint;
    const vaultTokenIn = getAssociatedTokenAddressSync(inputMint, vaultPda, true);
    const vaultTokenOut = getAssociatedTokenAddressSync(outputMint, vaultPda, true);

    // Derive DLMM PDAs
    const [oracle] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle"), poolAddress.toBuffer()],
      METEORA_DLMM_PROGRAM,
    );
    const [eventAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("__event_authority")],
      METEORA_DLMM_PROGRAM,
    );

    // Bin array account metas for remaining accounts
    const binArrayAccountMetas = swapQuote.binArraysPubkey.map(
      (pubkey: PublicKey) => ({
        pubkey,
        isSigner: false,
        isWritable: true,
      }),
    );

    const tx = await this.program.methods
      .executeSwap!(
        bnVaultNonce,
        bnDelegateNonce,
        bnAmountIn,
        swapQuote.minOutAmount,
        feedId,
      )
      .accounts({
        relayer: signer.publicKey,
        delegateKey: signer.publicKey,
        guardian: guardian,
        vault: vaultPda,
        delegate: delegatePda,
        priceUpdate: feedAccount,
        lbPair: poolAddress,
        reserveX: dlmmPool.lbPair.reserveX,
        reserveY: dlmmPool.lbPair.reserveY,
        userTokenIn: vaultTokenIn,
        userTokenOut: vaultTokenOut,
        tokenXMint: dlmmPool.lbPair.tokenXMint,
        tokenYMint: dlmmPool.lbPair.tokenYMint,
        oracle: oracle,
        tokenInMint: inputMint,
        tokenXProgram: TOKEN_PROGRAM_ID,
        tokenYProgram: TOKEN_PROGRAM_ID,
        eventAuthority: eventAuthority,
        dlmmProgram: METEORA_DLMM_PROGRAM,
      } as any)
      .remainingAccounts(binArrayAccountMetas)
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ])
      .signers([signer])
      .rpc();

    return { signature: tx, quote: swapQuote };
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

  async updateVault(
    nonce: number,
    newDailyCapSol?: number,
    newPerTxCapSol?: number,
    newAllowList?: PublicKey[],
    newDenyList?: PublicKey[],
  ) {
    const bnNonce = new BN(nonce);
    const [vaultPda] = findVaultPda(this.program.provider.publicKey!, bnNonce, this.program.programId);

    const newDailyCap = newDailyCapSol !== undefined ? new BN(newDailyCapSol * 1_000_000_000) : null;
    const newPerTxCap = newPerTxCapSol !== undefined ? new BN(newPerTxCapSol * 1_000_000_000) : null;

    const tx = await this.program.methods
      .updateVault!(bnNonce, newDailyCap, newPerTxCap, newAllowList ?? null, newDenyList ?? null)
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
