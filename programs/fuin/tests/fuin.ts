import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Fuin } from "../target/types/fuin";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { assert } from "chai";

const CAN_SWAP = 1;
const CAN_TRANSFER = 2;

// Scaled-down amounts for devnet (conserve SOL)
const SOL = (n: number) => new anchor.BN(n * LAMPORTS_PER_SOL);

/** Transfer SOL from guardian wallet to a PDA via SystemProgram */
async function fundAccount(
  provider: anchor.AnchorProvider,
  to: PublicKey,
  lamports: number
) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: to,
      lamports,
    })
  );
  await provider.sendAndConfirm(tx);
}

/** Confirm with retries for devnet reliability */
async function confirmTx(
  provider: anchor.AnchorProvider,
  sig: string
) {
  await provider.connection.confirmTransaction(sig, "confirmed");
}

describe("Fuin - Delegate Model (Devnet)", function () {
  this.timeout(120_000); // devnet is slower

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fuin as Program<Fuin>;
  const guardian = provider.wallet as anchor.Wallet;
  const agent = Keypair.generate();
  const destination = Keypair.generate();

  let vaultPda: PublicKey;
  let vaultNonce: anchor.BN;
  let vaultBump: number;
  let delegatePda: PublicKey;
  let delegateNonce: anchor.BN;
  let delegateBump: number;

  before(async () => {
    // derive vault PDA
    vaultNonce = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        guardian.publicKey.toBuffer(),
        vaultNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // derive delegate PDA
    delegateNonce = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    [delegatePda, delegateBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        vaultPda.toBuffer(),
        delegateNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  });

  after(async () => {
    // Cleanup: withdraw remaining SOL from vault back to guardian
    try {
      const vaultBalance = await provider.connection.getBalance(vaultPda);
      const vault = await program.account.vault.fetch(vaultPda);

      // Unfreeze if frozen
      if (vault.state && (vault.state as any).frozen) {
        await program.methods
          .unfreezeVault(vaultNonce)
          .accounts({ guardian: guardian.publicKey, vault: vaultPda })
          .rpc();
      }

      // Leave enough for rent exemption (~0.002 SOL for vault account)
      const rentExempt =
        await provider.connection.getMinimumBalanceForRentExemption(
          (await provider.connection.getAccountInfo(vaultPda))?.data.length ?? 0
        );
      const withdrawable = vaultBalance - rentExempt;
      if (withdrawable > 0) {
        await program.methods
          .withdraw(vaultNonce, new anchor.BN(withdrawable))
          .accounts({
            guardian: guardian.publicKey,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        console.log(
          `  [cleanup] Withdrew ${(withdrawable / LAMPORTS_PER_SOL).toFixed(4)} SOL from vault`
        );
      }
    } catch (e: any) {
      console.log(`  [cleanup] Could not withdraw from vault: ${e.message}`);
    }
  });

  it("B1. Initialize Vault", async () => {
    const dailyCap = SOL(1);
    const perTxCap = SOL(0.5);

    await program.methods
      .initVault(vaultNonce, dailyCap, perTxCap, [])
      .accounts({
        guardian: guardian.publicKey,
      })
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.ok(vault.policies.spending.dailyCap.eq(dailyCap));
    assert.ok(vault.guardian.equals(guardian.publicKey));
    assert.deepEqual(vault.state, { active: {} });
    assert.ok(vault.recovery.lastGuardianActivity.toNumber() > 0);
  });

  it("B2. Fund Vault", async () => {
    const before = await provider.connection.getBalance(vaultPda);
    await fundAccount(provider, vaultPda, 0.5 * LAMPORTS_PER_SOL);
    const after = await provider.connection.getBalance(vaultPda);
    assert.ok(after - before >= 0.5 * LAMPORTS_PER_SOL);
  });

  it("B3. Issue Delegate", async () => {
    const permissions = CAN_TRANSFER;
    const dailyLimit = SOL(0.5);
    const maxUses = 0; // unlimited
    const validity = new anchor.BN(60 * 60 * 24); // 24 hours

    await program.methods
      .issueDelegate(
        vaultNonce,
        delegateNonce,
        agent.publicKey,
        permissions,
        dailyLimit,
        maxUses,
        validity
      )
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const delegate = await program.account.delegate.fetch(delegatePda);
    assert.ok(delegate.authority.equals(agent.publicKey));
    assert.isTrue(delegate.isActive);
    assert.equal(delegate.permissions, CAN_TRANSFER);
  });

  it("B4. Execute Transfer", async () => {
    const vaultBefore = await provider.connection.getBalance(vaultPda);
    const amount = SOL(0.01);

    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, amount)
      .accounts({
        relayer: guardian.publicKey,
        delegateKey: agent.publicKey,
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
        destination: destination.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent])
      .rpc();

    const vaultAfter = await provider.connection.getBalance(vaultPda);
    assert.ok(vaultBefore - vaultAfter >= 0.01 * LAMPORTS_PER_SOL);
  });

  it("B5. Per-tx cap exceeded", async () => {
    // Lower per_tx_cap to 0.005 SOL
    await program.methods
      .updateVault(vaultNonce, null, SOL(0.005), null, null)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
        .accounts({
          relayer: guardian.publicKey,
          delegateKey: agent.publicKey,
          guardian: guardian.publicKey,
          vault: vaultPda,
          delegate: delegatePda,
          destination: destination.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to per-tx cap");
    } catch (error: any) {
      assert.include(error.message, "PerTxLimitExceeded");
    }

    // Restore per_tx_cap
    await program.methods
      .updateVault(vaultNonce, null, SOL(0.5), null, null)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();
  });

  it("B6. Permission denied", async () => {
    const swapAgent = Keypair.generate();
    const swapDelegateNonce = new anchor.BN(
      Math.floor(Math.random() * 1_000_000)
    );
    const [swapDelegatePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        vaultPda.toBuffer(),
        swapDelegateNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .issueDelegate(
        vaultNonce,
        swapDelegateNonce,
        swapAgent.publicKey,
        CAN_SWAP,
        SOL(0.1),
        0,
        new anchor.BN(86400)
      )
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: swapDelegatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(vaultNonce, swapDelegateNonce, SOL(0.01))
        .accounts({
          relayer: guardian.publicKey,
          delegateKey: swapAgent.publicKey,
          guardian: guardian.publicKey,
          vault: vaultPda,
          delegate: swapDelegatePda,
          destination: destination.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([swapAgent])
        .rpc();
      assert.fail("Should have failed due to permission denied");
    } catch (error: any) {
      assert.include(error.message, "PermissionDenied");
    }
  });

  it("B7. Freeze vault", async () => {
    await program.methods
      .freezeVault(vaultNonce)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
        .accounts({
          relayer: guardian.publicKey,
          delegateKey: agent.publicKey,
          guardian: guardian.publicKey,
          vault: vaultPda,
          delegate: delegatePda,
          destination: destination.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to frozen vault");
    } catch (error: any) {
      assert.include(error.message, "VaultFrozen");
    }
  });

  it("B8. Unfreeze vault", async () => {
    await program.methods
      .unfreezeVault(vaultNonce)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();

    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
      .accounts({
        relayer: guardian.publicKey,
        delegateKey: agent.publicKey,
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
        destination: destination.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.deepEqual(vault.state, { active: {} });
  });

  it("B9. Delegate control", async () => {
    // Pause (status=1)
    await program.methods
      .delegateControl(vaultNonce, delegateNonce, 1)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
        .accounts({
          relayer: guardian.publicKey,
          delegateKey: agent.publicKey,
          guardian: guardian.publicKey,
          vault: vaultPda,
          delegate: delegatePda,
          destination: destination.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to paused delegate");
    } catch (error: any) {
      assert.include(error.message, "DelegateInactive");
    }

    // Resume (status=2)
    await program.methods
      .delegateControl(vaultNonce, delegateNonce, 2)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
      })
      .rpc();

    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
      .accounts({
        relayer: guardian.publicKey,
        delegateKey: agent.publicKey,
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
        destination: destination.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent])
      .rpc();

    // Revoke (status=0)
    await program.methods
      .delegateControl(vaultNonce, delegateNonce, 0)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
        .accounts({
          relayer: guardian.publicKey,
          delegateKey: agent.publicKey,
          guardian: guardian.publicKey,
          vault: vaultPda,
          delegate: delegatePda,
          destination: destination.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to revoked delegate");
    } catch (error: any) {
      assert.ok(
        error.message.includes("DelegateInactive") ||
          error.message.includes("DelegateExpired")
      );
    }
  });

  it("B10. Update vault", async () => {
    const newDailyCap = SOL(2);
    const newPerTxCap = SOL(0.2);

    await program.methods
      .updateVault(vaultNonce, newDailyCap, newPerTxCap, null, null)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.ok(vault.policies.spending.dailyCap.eq(newDailyCap));
    assert.ok(vault.policies.spending.perTxCap.eq(newPerTxCap));
  });

  it("B11. Withdraw", async () => {
    const balanceBefore = await provider.connection.getBalance(vaultPda);
    const withdrawAmount = SOL(0.05);

    await program.methods
      .withdraw(vaultNonce, withdrawAmount)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(balanceBefore - balanceAfter, 0.05 * LAMPORTS_PER_SOL);
  });
});

// ─── Policy Enforcement & Limit Exhaustion ───────────────────────────────────

describe("Fuin - Policy Enforcement (Devnet)", function () {
  this.timeout(120_000);

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fuin as Program<Fuin>;
  const guardian = provider.wallet as anchor.Wallet;
  const destination = Keypair.generate();

  // Track vaults for cleanup
  const createdVaults: { pda: PublicKey; nonce: anchor.BN }[] = [];

  async function setupVaultAndDelegate(opts: {
    dailyCap: number;
    perTxCap: number;
    allowedPrograms?: PublicKey[];
    delegatePermissions: number;
    delegateDailyLimit: number;
    delegateMaxUses: number;
  }) {
    const vaultNonce = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        guardian.publicKey.toBuffer(),
        vaultNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .initVault(
        vaultNonce,
        new anchor.BN(opts.dailyCap),
        new anchor.BN(opts.perTxCap),
        opts.allowedPrograms ?? []
      )
      .accounts({ guardian: guardian.publicKey })
      .rpc();

    // Fund vault from guardian wallet
    await fundAccount(provider, vaultPda, 0.2 * LAMPORTS_PER_SOL);

    // Issue delegate
    const agent = Keypair.generate();
    const delegateNonce = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    const [delegatePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        vaultPda.toBuffer(),
        delegateNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .issueDelegate(
        vaultNonce,
        delegateNonce,
        agent.publicKey,
        opts.delegatePermissions,
        new anchor.BN(opts.delegateDailyLimit),
        opts.delegateMaxUses,
        new anchor.BN(86400)
      )
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        delegate: delegatePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    createdVaults.push({ pda: vaultPda, nonce: vaultNonce });
    return { vaultPda, vaultNonce, delegatePda, delegateNonce, agent };
  }

  function transferAccounts(
    vaultPda: PublicKey,
    delegatePda: PublicKey,
    agentPublicKey: PublicKey
  ) {
    return {
      relayer: guardian.publicKey,
      delegateKey: agentPublicKey,
      guardian: guardian.publicKey,
      vault: vaultPda,
      delegate: delegatePda,
      destination: destination.publicKey,
      systemProgram: SystemProgram.programId,
    };
  }

  after(async () => {
    // Cleanup: withdraw from all created vaults
    for (const { pda, nonce } of createdVaults) {
      try {
        const balance = await provider.connection.getBalance(pda);
        const acctInfo = await provider.connection.getAccountInfo(pda);
        if (!acctInfo) continue;
        const rentExempt =
          await provider.connection.getMinimumBalanceForRentExemption(
            acctInfo.data.length
          );
        const withdrawable = balance - rentExempt;
        if (withdrawable > 0) {
          await program.methods
            .withdraw(nonce, new anchor.BN(withdrawable))
            .accounts({
              guardian: guardian.publicKey,
              vault: pda,
              systemProgram: SystemProgram.programId,
            })
            .rpc();
          console.log(
            `  [cleanup] Withdrew ${(withdrawable / LAMPORTS_PER_SOL).toFixed(4)} SOL from ${pda.toBase58().slice(0, 8)}...`
          );
        }
      } catch (e: any) {
        console.log(
          `  [cleanup] Skipped ${pda.toBase58().slice(0, 8)}...: ${e.message?.slice(0, 60)}`
        );
      }
    }
  });

  it("P1. SOL transfer succeeds with allow-list set", async () => {
    const randomProgram = Keypair.generate().publicKey;
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 1 * LAMPORTS_PER_SOL,
        perTxCap: 0.5 * LAMPORTS_PER_SOL,
        allowedPrograms: [randomProgram],
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 0.5 * LAMPORTS_PER_SOL,
        delegateMaxUses: 0,
      });

    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, SOL(0.01))
      .accounts(transferAccounts(vaultPda, delegatePda, agent.publicKey))
      .signers([agent])
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.ok(vault.policies.programs.allowList.length === 1);
  });

  it("P2. Vault daily limit exhaustion", async () => {
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 0.05 * LAMPORTS_PER_SOL,
        perTxCap: 0.05 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 1 * LAMPORTS_PER_SOL,
        delegateMaxUses: 0,
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);

    // First: 0.04 SOL — succeed
    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, SOL(0.04))
      .accounts(accounts)
      .signers([agent])
      .rpc();

    // Second: 0.02 SOL — fail (0.04 + 0.02 > 0.05)
    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.02))
        .accounts(accounts)
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to vault daily limit");
    } catch (error: any) {
      assert.include(error.message, "DailyLimitExceeded");
    }
  });

  it("P3. Delegate daily limit exhaustion", async () => {
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 1 * LAMPORTS_PER_SOL,
        perTxCap: 0.5 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 0.03 * LAMPORTS_PER_SOL,
        delegateMaxUses: 0,
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);

    // First: 0.02 SOL — succeed
    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, SOL(0.02))
      .accounts(accounts)
      .signers([agent])
      .rpc();

    // Second: 0.02 SOL — fail (0.02 + 0.02 > 0.03)
    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, SOL(0.02))
        .accounts(accounts)
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to delegate daily limit");
    } catch (error: any) {
      assert.include(error.message, "DailyLimitExceeded");
    }
  });

  it("P4. Max uses exhaustion", async () => {
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 1 * LAMPORTS_PER_SOL,
        perTxCap: 0.5 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 1 * LAMPORTS_PER_SOL,
        delegateMaxUses: 2,
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);
    const amount = SOL(0.001);

    // Use 1 — succeed
    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, amount)
      .accounts(accounts)
      .signers([agent])
      .rpc();

    // Use 2 — succeed
    await program.methods
      .executeTransfer(vaultNonce, delegateNonce, amount)
      .accounts(accounts)
      .signers([agent])
      .rpc();

    const delegate = await program.account.delegate.fetch(delegatePda);
    assert.equal(delegate.uses, 2);

    // Use 3 — fail
    try {
      await program.methods
        .executeTransfer(vaultNonce, delegateNonce, amount)
        .accounts(accounts)
        .signers([agent])
        .rpc();
      assert.fail("Should have failed due to max uses exceeded");
    } catch (error: any) {
      assert.include(error.message, "MaxUsesExceeded");
    }
  });
});
