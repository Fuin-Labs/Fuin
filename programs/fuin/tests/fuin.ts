import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import { Fuin } from "../target/types/fuin";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("Fuin - Admin Layer",()=>{
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fuin as Program<Fuin>;
  const guardian = provider.wallet as anchor.Wallet;
  const agent = Keypair.generate();
  const destination = Keypair.generate();

  let vaultPda: PublicKey;
  let vaultNonce: anchor.BN;
  let vaultBump : number;
  let sessionPda: PublicKey;
  let sessionNonce: anchor.BN;
  let sessionBump : number;

  before( async()=>{
    // derive vault PDA 
    vaultNonce = new anchor.BN(Math.floor(Math.random()*1000000));
    [vaultPda,vaultBump] = PublicKey.findProgramAddressSync([
      Buffer.from("vault"),
      guardian.publicKey.toBuffer(),
      vaultNonce.toArrayLike(Buffer,"le",8)
    ], program.programId)

    // derive Session PDA 
    sessionNonce = new anchor.BN(Math.floor(Math.random() * 1000000));
    [sessionPda, sessionBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        guardian.publicKey.toBuffer(),
        vaultPda.toBuffer(),
        sessionNonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await provider.connection.requestAirdrop(guardian.publicKey,20*LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(tx);
  })
  
  it("1. Initialize Vault",async()=>{
    const dailyLimits = new anchor.BN(10*LAMPORTS_PER_SOL); // 10 SOL
    const whitelist = [destination.publicKey];

    await program.methods
      .initVault(vaultNonce,dailyLimits,whitelist)
      .accounts({
        guardian:guardian.publicKey,
    }).rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    assert.ok(vault.dailyLimit.eq(dailyLimits));
    assert.ok(vault.guardian.equals(guardian.publicKey));
  })

  it("2. Funds vault", async () => {
    const before = await provider.connection.getBalance(vaultPda);

    const tx = await provider.connection.requestAirdrop(
      vaultPda,
      10 * LAMPORTS_PER_SOL
    );

    await provider.connection.confirmTransaction(tx);

    const after = await provider.connection.getBalance(vaultPda);

    assert.equal(after - before, 10 * LAMPORTS_PER_SOL);
  });


  it("3. Issue Session Key",async ()=>{

    const validity = new anchor.BN(60*60*24); //24 hours 
    const limit = new anchor.BN(1* LAMPORTS_PER_SOL); // 1 SOL AGENT LIMIT
    await program.methods
      .issueSession(vaultNonce,sessionNonce,agent.publicKey,validity,limit,null)
      .accounts({
        guardian:guardian.publicKey,
      })
      .rpc();

    const session = await program.account.session.fetch(sessionPda);
    assert.ok(session.authority.equals(agent.publicKey));
    assert.ok(session.isActive);
  })

  it("4. Update Vault (Change Limits)", async () => {
    const newLimit = new anchor.BN(50 * LAMPORTS_PER_SOL); // Increase to 50 SOL
    
    await program.methods
      .updateVault(
        vaultNonce, 
        newLimit, // New Limit
        null      // Keep whitelist same
      )
      .accounts({
        guardian: guardian.publicKey,
      })
      .rpc();

    const vault = await program.account.vault.fetch(vaultPda);
    console.log("vault",vault.dailyLimit);
    console.log("new limit",newLimit);
    assert.ok(vault.dailyLimit.eq(newLimit), "Daily limit should be updated");
  });

  it("5. Test Kill Switch (Pause Session)", async () => {
    // STATUS: 0=Revoke, 1=Pause, 2=Active
    await program.methods
      .sessionControl(vaultNonce,sessionNonce,1)
      .accounts({
        relayer: guardian.publicKey,
        sessionKey: agent.publicKey,
        guardian:guardian.publicKey,
        vault:vaultPda,
        session: sessionPda,
        destination:destination.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

      const session = await program.account.session.fetch(sessionPda);
      assert.isFalse(session.isActive, "Session should be inactive (paused)");

      try{
        await program.methods
            .executeTransfer(vaultNonce, sessionNonce, new anchor.BN(0.1 * LAMPORTS_PER_SOL))
            .accounts({
                relayer: guardian.publicKey,
                sessionKey: agent.publicKey,
                guardian: guardian.publicKey,
                destination: destination.publicKey,
            })
            .signers([agent])
            .rpc();
        assert.fail("Should have failed because session is paused");
      }catch(error){
        console.log("error",error.message);
        assert.include(error.message, "SessionInactive");
      }
  })

  it("6. Resume Session", async () => {
    // Status: 2 = Unpause
    await program.methods
      .sessionControl(vaultNonce, sessionNonce, 2)
      .accounts({
        guardian: guardian.publicKey,
        vault: vaultPda,
        session: sessionPda,
      })
      .rpc();

    const session = await program.account.session.fetch(sessionPda);
    assert.isTrue(session.isActive, "Session should be active again");
  });

  it("7. Emergency Withdraw", async () => {
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

    const vaultBalance = await provider.connection.getBalance(vaultPda);
    assert.equal(balanceBefore - vaultBalance, 1 * LAMPORTS_PER_SOL); 
  });

})
