import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export const ACTOR_NAMES = [
  "user",
  "orchestrator",
  "research",
  "executeAgent",
  "audit",
  "rogue",
] as const;
export type ActorName = (typeof ACTOR_NAMES)[number];

export interface StoredActor {
  secretKey: string;
  pubkey: string;
}

export interface IntentRecord {
  pda: string;
  role: "root" | "research" | "execute" | "audit" | "rogue";
  agent_actor: ActorName;
}

export interface SwarmState {
  actors: Record<ActorName, StoredActor>;
  intents: IntentRecord[];
  fundingSig?: string;
}

export class Keystore {
  private state: SwarmState | null = null;
  constructor(private readonly path: string) {
    if (existsSync(path)) {
      this.state = JSON.parse(readFileSync(path, "utf8")) as SwarmState;
    }
  }

  isInitialized(): boolean {
    return this.state !== null;
  }

  generate(): SwarmState {
    const actors = {} as Record<ActorName, StoredActor>;
    for (const name of ACTOR_NAMES) {
      const kp = Keypair.generate();
      actors[name] = {
        secretKey: bs58.encode(kp.secretKey),
        pubkey: kp.publicKey.toBase58(),
      };
    }
    this.state = { actors, intents: [] };
    this.persist();
    return this.state;
  }

  reset(): void {
    this.state = null;
    if (existsSync(this.path)) {
      writeFileSync(this.path, "");
      // unlink is safer but we want zero risk on demo; truncate instead
      try {
        const fs = require("node:fs") as typeof import("node:fs");
        fs.unlinkSync(this.path);
      } catch {
        /* ignore */
      }
    }
  }

  getState(): SwarmState {
    if (!this.state) throw new Error("keystore not initialized — call /demo/init first");
    return this.state;
  }

  getKeypair(name: ActorName): Keypair {
    const a = this.getState().actors[name];
    if (!a) throw new Error(`unknown actor: ${name}`);
    return Keypair.fromSecretKey(bs58.decode(a.secretKey));
  }

  getPubkey(name: ActorName): PublicKey {
    return new PublicKey(this.getState().actors[name].pubkey);
  }

  resolveAgentName(pubkey: PublicKey): ActorName | null {
    const s = this.getState();
    const target = pubkey.toBase58();
    for (const name of ACTOR_NAMES) {
      if (s.actors[name].pubkey === target) return name;
    }
    return null;
  }

  recordIntent(record: IntentRecord): void {
    const s = this.getState();
    s.intents.push(record);
    this.persist();
  }

  setFundingSig(sig: string): void {
    const s = this.getState();
    s.fundingSig = sig;
    this.persist();
  }

  private persist(): void {
    writeFileSync(this.path, JSON.stringify(this.state, null, 2));
  }
}
