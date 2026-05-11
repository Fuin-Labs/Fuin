import type { Idl } from "@coral-xyz/anchor";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadFuinIdl(): Idl {
  const idlPath = resolve(
    new URL("../../../programs/fuin/target/idl/fuin.json", import.meta.url).pathname
  );
  return JSON.parse(readFileSync(idlPath, "utf8")) as Idl;
}
