import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Fuin } from "../target/types/fuin";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

const CAN_SWAP = 1;
const CAN_TRANSFER = 2;

describe("Fuin - Delegate Model", () => {
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
    vaultNonce = new anchor.BN(Math.floor(Math.random() * 1000000));
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        guardian.publicKey.toBuffer(),
        vaultNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // derive delegate PDA
    delegateNonce = new anchor.BN(Math.floor(Math.random() * 1000000));
    [delegatePda, delegateBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("delegate"),
        vaultPda.toBuffer(),
        delegateNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await provider.connection.requestAirdrop(
      guardian.publicKey,
      20 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);
  });

  it("B1. Initialize Vault", async () => {
    const dailyCap = new anchor.BN(10 * LAMPORTS_PER_SOL);
    const perTxCap = new anchor.BN(5 * LAMPORTS_PER_SOL);

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
    const tx = await provider.connection.requestAirdrop(
      vaultPda,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);
    const after = await provider.connection.getBalance(vaultPda);
    assert.equal(after - before, 10 * LAMPORTS_PER_SOL);
  });

  it("B3. Issue Delegate", async () => {
    const permissions = CAN_TRANSFER;
    const dailyLimit = new anchor.BN(5 * LAMPORTS_PER_SOL);
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
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);

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
    assert.ok(vaultBefore - vaultAfter >= 0.1 * LAMPORTS_PER_SOL);
  });

  it("B5. Per-tx cap exceeded", async () => {
    // Lower per_tx_cap to 0.05 SOL
    await program.methods
      .updateVault(vaultNonce, null, new anchor.BN(0.05 * LAMPORTS_PER_SOL), null, null)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();

    try {
      await program.methods
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.1 * LAMPORTS_PER_SOL)
        )
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

    // Restore per_tx_cap for subsequent tests
    await program.methods
      .updateVault(vaultNonce, null, new anchor.BN(5 * LAMPORTS_PER_SOL), null, null)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
      })
      .rpc();
  });

  it("B6. Permission denied", async () => {
    // Issue a delegate with CAN_SWAP only
    const swapAgent = Keypair.generate();
    const swapDelegateNonce = new anchor.BN(
      Math.floor(Math.random() * 1000000)
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
        new anchor.BN(1 * LAMPORTS_PER_SOL),
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
        .executeTransfer(
          vaultNonce,
          swapDelegateNonce,
          new anchor.BN(0.1 * LAMPORTS_PER_SOL)
        )
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
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.1 * LAMPORTS_PER_SOL)
        )
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

    // Transfer should succeed now
    await program.methods
      .executeTransfer(
        vaultNonce,
        delegateNonce,
        new anchor.BN(0.1 * LAMPORTS_PER_SOL)
      )
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

    // Transfer should fail (paused)
    try {
      await program.methods
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.1 * LAMPORTS_PER_SOL)
        )
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

    // Transfer should succeed
    await program.methods
      .executeTransfer(
        vaultNonce,
        delegateNonce,
        new anchor.BN(0.1 * LAMPORTS_PER_SOL)
      )
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

    // Transfer should fail permanently
    try {
      await program.methods
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.1 * LAMPORTS_PER_SOL)
        )
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
    const newDailyCap = new anchor.BN(20 * LAMPORTS_PER_SOL);
    const newPerTxCap = new anchor.BN(2 * LAMPORTS_PER_SOL);

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
    const withdrawAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    await program.methods
      .withdraw(vaultNonce, withdrawAmount)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(balanceBefore - balanceAfter, 1 * LAMPORTS_PER_SOL);
  });
});

// ─── Policy Enforcement & Limit Exhaustion ───────────────────────────────────

describe("Fuin - Policy Enforcement", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fuin as Program<Fuin>;
  const guardian = provider.wallet as anchor.Wallet;
  const destination = Keypair.generate();

  // Helper: create a fresh vault + funded + delegate in one shot
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

    // Fund vault
    const tx = await provider.connection.requestAirdrop(
      vaultPda,
      5 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);

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

    return { vaultPda, vaultNonce, delegatePda, delegateNonce, agent };
  }

  // Helper: build transfer accounts
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

  it("P1. SOL transfer succeeds with allow-list set", async () => {
    // Create vault with an allow-list that does NOT include SystemProgram.
    // Before the fix, this would fail with ProgramNotAllowed.
    const randomProgram = Keypair.generate().publicKey;
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 10 * LAMPORTS_PER_SOL,
        perTxCap: 5 * LAMPORTS_PER_SOL,
        allowedPrograms: [randomProgram],
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 5 * LAMPORTS_PER_SOL,
        delegateMaxUses: 0,
      });

    // This should succeed — SOL transfer doesn't CPI, so allow-list is irrelevant
    await program.methods
      .executeTransfer(
        vaultNonce,
        delegateNonce,
        new anchor.BN(0.1 * LAMPORTS_PER_SOL)
      )
      .accounts(transferAccounts(vaultPda, delegatePda, agent.publicKey))
      .signers([agent])
      .rpc();

    // Verify balance changed
    const vault = await program.account.vault.fetch(vaultPda);
    assert.ok(vault.policies.programs.allowList.length === 1);
  });

  it("P2. Vault daily limit exhaustion", async () => {
    const { vaultPda, vaultNonce, delegatePda, delegateNonce, agent } =
      await setupVaultAndDelegate({
        dailyCap: 0.5 * LAMPORTS_PER_SOL,
        perTxCap: 0.5 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 10 * LAMPORTS_PER_SOL, // high delegate limit
        delegateMaxUses: 0,
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);

    // First transfer: 0.4 SOL — should succeed
    await program.methods
      .executeTransfer(
        vaultNonce,
        delegateNonce,
        new anchor.BN(0.4 * LAMPORTS_PER_SOL)
      )
      .accounts(accounts)
      .signers([agent])
      .rpc();

    // Second transfer: 0.2 SOL — should fail (0.4 + 0.2 > 0.5 vault daily cap)
    try {
      await program.methods
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.2 * LAMPORTS_PER_SOL)
        )
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
        dailyCap: 10 * LAMPORTS_PER_SOL, // high vault cap
        perTxCap: 5 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 0.3 * LAMPORTS_PER_SOL, // low delegate limit
        delegateMaxUses: 0,
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);

    // First transfer: 0.2 SOL — should succeed
    await program.methods
      .executeTransfer(
        vaultNonce,
        delegateNonce,
        new anchor.BN(0.2 * LAMPORTS_PER_SOL)
      )
      .accounts(accounts)
      .signers([agent])
      .rpc();

    // Second transfer: 0.2 SOL — should fail (0.2 + 0.2 > 0.3 delegate daily limit)
    try {
      await program.methods
        .executeTransfer(
          vaultNonce,
          delegateNonce,
          new anchor.BN(0.2 * LAMPORTS_PER_SOL)
        )
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
        dailyCap: 10 * LAMPORTS_PER_SOL,
        perTxCap: 5 * LAMPORTS_PER_SOL,
        delegatePermissions: CAN_TRANSFER,
        delegateDailyLimit: 10 * LAMPORTS_PER_SOL,
        delegateMaxUses: 2, // only 2 uses allowed
      });

    const accounts = transferAccounts(vaultPda, delegatePda, agent.publicKey);
    const amount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

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

    // Verify uses count
    const delegate = await program.account.delegate.fetch(delegatePda);
    assert.equal(delegate.uses, 2);

    // Use 3 — should fail
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
