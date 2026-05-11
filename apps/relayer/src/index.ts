import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.json({ name: "fuin-relayer", status: "ok" }));

const port = Number(process.env.RELAYER_PORT ?? 8788);
const host = process.env.RELAYER_HOST ?? "127.0.0.1";

serve({ fetch: app.fetch, port, hostname: host }, (info) => {
  console.log(`fuin-relayer listening on http://${info.address}:${info.port}`);
});
