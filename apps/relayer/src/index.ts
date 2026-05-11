import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadConfig } from "./config.js";
import { loadFuinIdl } from "./idl.js";
import { Keystore } from "./keystore.js";
import { demoRoutes } from "./routes/demo.js";
import { intentsRoutes } from "./routes/intents.js";
import { actionsRoutes } from "./routes/actions.js";
import { paymasterRoutes } from "./routes/paymaster.js";

const config = loadConfig();
const idl = loadFuinIdl();
const keystore = new Keystore(config.stateFile);

const app = new Hono();

app.get("/", (c) =>
  c.json({
    name: "fuin-relayer",
    version: "0.1.0",
    programId: config.programId.toBase58(),
    funder: config.funder.publicKey.toBase58(),
    stateFile: config.stateFile,
    initialized: keystore.isInitialized(),
  })
);

app.route("/demo", demoRoutes(config, keystore));
app.route("/intents", intentsRoutes(config, keystore, idl));
app.route("/actions", actionsRoutes(config, keystore, idl));
app.route("/paymaster", paymasterRoutes(config));

serve(
  { fetch: app.fetch, port: config.port, hostname: config.host },
  (info) => {
    console.log(`fuin-relayer listening on http://${info.address}:${info.port}`);
    console.log(`  programId: ${config.programId.toBase58()}`);
    console.log(`  funder:    ${config.funder.publicKey.toBase58()}`);
    console.log(`  state:     ${config.stateFile}`);
  }
);
