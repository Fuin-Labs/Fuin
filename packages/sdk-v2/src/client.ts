import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { GoalPredicateData } from "./predicate";
import { deriveIntentPda } from "./pda";

export const FUIN_V2_PROGRAM_ID = new PublicKey(
  "E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy"
);

export interface IntentRef {
  pda: PublicKey;
  user: PublicKey;
  agent: PublicKey;
  parentIntent: PublicKey | null;
  budget: bigint;
  remainingBudget: bigint;
  expiresAt: bigint;
  depth: number;
  revoked: boolean;
}

export interface SignRootOpts {
  user: Signer;
  agent: PublicKey;
  predicate: GoalPredicateData;
  budget: bigint | number;
  expiresAt: bigint | number;
  nonce?: bigint | number;
}

export interface DeriveChildOpts {
  parentAgent: Signer;
  parent: PublicKey;
  childAgent: PublicKey;
  predicate: GoalPredicateData;
  budget: bigint | number;
  expiresAt: bigint | number;
  nonce?: bigint | number;
}

export interface VerifyAuthorizesOpts {
  agent: Signer;
  intent: PublicKey;
  ancestors: PublicKey[];
  /** Index in the transaction of the action instruction Fuin should validate. */
  targetIxIndex: number;
}

/**
 * High-level Fuin v2 client. Wraps Anchor program calls for the four core
 * handlers. Built around a generic shape — the client doesn't depend on
 * generated IDL types so it stays compact.
 */
export class Fuin {
  readonly program: anchor.Program;
  readonly programId: PublicKey;
  readonly connection: Connection;

  constructor(opts: {
    provider: anchor.AnchorProvider;
    programId?: PublicKey;
    idl: anchor.Idl;
  }) {
    this.programId = opts.programId ?? FUIN_V2_PROGRAM_ID;
    this.connection = opts.provider.connection;
    this.program = new anchor.Program(opts.idl, opts.provider);
  }

  /** Read an intent account from chain. */
  async fetchIntent(pda: PublicKey): Promise<IntentRef> {
    const acc = await (this.program.account as any).intent.fetch(pda);
    return {
      pda,
      user: acc.user,
      agent: acc.agent,
      parentIntent: acc.parentIntent ?? null,
      budget: BigInt(acc.budget.toString()),
      remainingBudget: BigInt(acc.remainingBudget.toString()),
      expiresAt: BigInt(acc.expiresAt.toString()),
      depth: acc.depth,
      revoked: acc.revoked,
    };
  }

  async signRootIntent(opts: SignRootOpts): Promise<{ pda: PublicKey; sig: string }> {
    const nonceBn = new BN((opts.nonce ?? Date.now()).toString());
    const [pda] = deriveIntentPda(
      this.programId,
      opts.user.publicKey,
      opts.agent,
      nonceBn
    );
    const sig = await this.program.methods
      .signRootIntent(
        nonceBn,
        opts.predicate as any,
        new BN(opts.budget.toString()),
        new BN(opts.expiresAt.toString())
      )
      .accountsStrict({
        user: opts.user.publicKey,
        agent: opts.agent,
        intent: pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([opts.user as Keypair])
      .rpc();
    return { pda, sig };
  }

  async deriveChildIntent(
    opts: DeriveChildOpts
  ): Promise<{ pda: PublicKey; sig: string }> {
    const parentAcc = await this.fetchIntent(opts.parent);
    const nonceBn = new BN((opts.nonce ?? Date.now()).toString());
    const [pda] = deriveIntentPda(
      this.programId,
      parentAcc.user,
      opts.childAgent,
      nonceBn
    );
    const sig = await this.program.methods
      .deriveChildIntent(
        nonceBn,
        opts.predicate as any,
        new BN(opts.budget.toString()),
        new BN(opts.expiresAt.toString())
      )
      .accountsStrict({
        parentAgent: opts.parentAgent.publicKey,
        parentIntent: opts.parent,
        childAgent: opts.childAgent,
        childIntent: pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([opts.parentAgent as Keypair])
      .rpc();
    return { pda, sig };
  }

  /**
   * Build (but do not send) the verify_authorizes instruction. Pair this with
   * the action instruction in a single transaction — Fuin runs as a sibling
   * verifier, NOT a CPI wrapper. If verify_authorizes fails, the whole tx
   * reverts and the action never executes.
   *
   * Caller passes the parent chain in `ancestors` (root last). Fuin walks the
   * chain checking revocation/expiry/user mismatch and evaluating each
   * ancestor's predicate against the parsed action.
   */
  async buildVerifyAuthorizesIx(
    opts: Omit<VerifyAuthorizesOpts, "agent"> & { agentPubkey: PublicKey }
  ): Promise<TransactionInstruction> {
    return this.program.methods
      .verifyAuthorizes(opts.targetIxIndex)
      .accountsStrict({
        agent: opts.agentPubkey,
        intent: opts.intent,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .remainingAccounts(
        opts.ancestors.map((pk) => ({
          pubkey: pk,
          isSigner: false,
          isWritable: false,
        }))
      )
      .instruction();
  }

  async revokeIntent(user: Signer, intent: PublicKey): Promise<string> {
    return this.program.methods
      .revokeIntent()
      .accountsStrict({ user: user.publicKey, intent })
      .signers([user as Keypair])
      .rpc();
  }

  /**
   * Compose a tx: verify_authorizes(ix0) + actionIx(ix1). Send + confirm.
   * Convenience wrapper over buildVerifyAuthorizesIx.
   */
  async sendVerifiedAction(opts: {
    agent: Signer;
    intent: PublicKey;
    ancestors: PublicKey[];
    actionIx: TransactionInstruction;
  }): Promise<string> {
    const verifyIx = await this.buildVerifyAuthorizesIx({
      agentPubkey: opts.agent.publicKey,
      intent: opts.intent,
      ancestors: opts.ancestors,
      targetIxIndex: 1,
    });
    const tx = new Transaction().add(verifyIx, opts.actionIx);
    return sendAndConfirmTransaction(this.connection, tx, [opts.agent as Keypair]);
  }
}
