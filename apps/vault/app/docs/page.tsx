"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import "../landing.css";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "guardian-dashboard", label: "Guardian Dashboard" },
  { id: "mcp-setup", label: "MCP Server Setup" },
  { id: "available-tools", label: "Available Tools" },
  { id: "agent-actions", label: "Agent Actions" },
  { id: "policy-guardrails", label: "Policy Guardrails" },
  { id: "reference", label: "Reference" },
];

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="my-4 rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-white/10 text-xs text-white/40 font-mono">{title}</div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-white/80">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="bg-white/5 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-sm">{children}</code>;
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-section font-geist text-white mt-20 mb-6 scroll-mt-8">
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-semibold font-geist text-white mt-10 mb-4">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-white/70 font-geist leading-relaxed mb-4">{children}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-white/60 font-medium font-geist">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-white/70 font-geist">
                  {cell.startsWith("`") && cell.endsWith("`")
                    ? <InlineCode>{cell.slice(1, -1)}</InlineCode>
                    : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveSection(topmost.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Fuin" className="h-8 w-8" />
            <span className="text-sm font-semibold font-geist text-white">Docs</span>
          </Link>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="text-white/70 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10 text-sm font-geist"
          >
            {mobileNavOpen ? "Close" : "Menu"}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="px-4 pb-4 border-b border-white/10 bg-black/95">
            <nav className="flex flex-col gap-1">
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-geist transition-colors ${
                    activeSection === id
                      ? "text-white bg-white/5"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-40">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="Fuin" className="h-10 w-10" />
            <div>
              <span className="text-sm font-semibold font-geist text-white group-hover:text-white/80 transition-colors">Fuin</span>
              <span className="block text-[10px] font-pixel text-white/40 tracking-widest uppercase">Documentation</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-geist transition-all mb-0.5 relative ${
                activeSection === id
                  ? "text-white bg-white/5"
                  : "text-white/50 hover:text-white/70 hover:bg-white/[0.02]"
              }`}
            >
              {activeSection === id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full" />
              )}
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors font-geist"
          >
            <span>&larr;</span> Back to Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 px-6 md:px-12 lg:px-16 pt-20 md:pt-16 pb-24 max-w-3xl">
        {/* Overview */}
        <SectionHeading id="overview">Overview</SectionHeading>
        <Paragraph>
          Fuin is a programmable Identity Access Management (IAM) layer built natively for Solana. It enables guardians to create on-chain vaults (PDAs) and issue delegate keys with bitmask permissions, spending caps, and policy constraints to AI agents or human operators.
        </Paragraph>

        <SubHeading>Core Concepts</SubHeading>

        <div className="grid gap-3 my-6">
          {[
            { title: "Vault", desc: "An on-chain PDA that holds funds and enforces policies. Created by a guardian with configurable rules." },
            { title: "Delegate", desc: "A scoped access key issued to an agent or operator. Carries bitmask permissions, spending limits, and expiry." },
            { title: "Guardian", desc: "The vault owner. Creates vaults, sets policies, deposits funds, issues delegates, and retains ultimate control." },
            { title: "Policy Engine", desc: "The on-chain validation layer. Checks permissions, spending caps, program allowlists, time windows, and risk thresholds before every transaction." },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-[#0f0f0f] p-4">
              <div className="text-sm font-medium font-geist text-white mb-1">{title}</div>
              <div className="text-sm text-white/50 font-geist">{desc}</div>
            </div>
          ))}
        </div>

        <Paragraph>
          Delegates operate within strict on-chain constraints. Every transaction is validated by the policy engine before execution &mdash; there is no way to bypass limits without the guardian&apos;s intervention.
        </Paragraph>

        {/* Quick Start */}
        <SectionHeading id="quick-start">Quick Start</SectionHeading>

        <SubHeading>Prerequisites</SubHeading>
        <ul className="list-disc list-inside text-white/70 font-geist space-y-2 mb-6">
          <li>Solana CLI installed (<InlineCode>solana</InlineCode>, <InlineCode>spl-token</InlineCode>)</li>
          <li>Anchor CLI installed (<InlineCode>anchor</InlineCode>)</li>
          <li>Node.js + pnpm installed</li>
          <li>Phantom wallet (or any Solana wallet) set to devnet</li>
        </ul>

        <SubHeading>Deploy the Program</SubHeading>
        <CodeBlock title="Terminal">{`# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Fund your deployer wallet
solana airdrop 5

# Build and deploy
cd programs/fuin
anchor build
anchor deploy

# Copy IDL to SDK
cp target/idl/fuin.json ../../packages/sdk/src/idl/fuin.json

# Build the monorepo
cd ../..
pnpm build`}</CodeBlock>

        <Paragraph>
          Program ID: <InlineCode>E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy</InlineCode>
        </Paragraph>

        <SubHeading>Generate an Agent Keypair</SubHeading>
        <Paragraph>
          You need two keypairs: your <strong className="text-white">Guardian</strong> wallet (e.g. Phantom) and a separate <strong className="text-white">Agent</strong> keypair for the delegate.
        </Paragraph>
        <CodeBlock title="Terminal">{`# Generate agent keypair
solana-keygen new -o ~/.config/solana/agent.json
solana address -k ~/.config/solana/agent.json

# Get base58 private key for MCP config
node -e "
const fs = require('fs');
const bs58 = require('bs58');
const raw = JSON.parse(fs.readFileSync(
  process.env.HOME + '/.config/solana/agent.json'
));
console.log(bs58.encode(Buffer.from(raw)));
"

# Fund the agent wallet (it pays tx fees as relayer)
solana airdrop 1 $(solana address -k ~/.config/solana/agent.json)`}</CodeBlock>

        {/* Guardian Dashboard */}
        <SectionHeading id="guardian-dashboard">Guardian Dashboard</SectionHeading>

        <Paragraph>
          The Guardian Dashboard is a Next.js app that provides a full management UI for your vaults and delegates.
        </Paragraph>

        <SubHeading>Create a Vault</SubHeading>
        <ol className="list-decimal list-inside text-white/70 font-geist space-y-3 mb-6">
          <li>Launch the guardian app (<InlineCode>pnpm dev:guardian</InlineCode> on port 3001)</li>
          <li>Connect your Phantom wallet (set to devnet)</li>
          <li>Click &quot;Create Vault&quot; &mdash; this creates a vault PDA on-chain</li>
          <li>Fund the vault by sending SOL from Phantom to the vault PDA address shown in the UI</li>
        </ol>

        <SubHeading>Issue a Delegate</SubHeading>
        <ol className="list-decimal list-inside text-white/70 font-geist space-y-3 mb-6">
          <li>Navigate to your vault detail page</li>
          <li>Click &quot;Issue Delegate&quot;</li>
          <li>Enter the agent&apos;s public key (from the keypair generated above)</li>
          <li>Set permissions using the bitmask (e.g. <InlineCode>3</InlineCode> for CAN_SWAP + CAN_TRANSFER)</li>
          <li>Set a daily spending cap (e.g. 1 SOL)</li>
          <li>Submit &mdash; the delegate PDA is created on-chain</li>
        </ol>

        <SubHeading>Manage Delegates</SubHeading>
        <Paragraph>
          From the dashboard you can pause, resume, or permanently revoke delegates. Status codes:
        </Paragraph>
        <Table
          headers={["Code", "Action", "Reversible"]}
          rows={[
            ["0", "Revoke (permanent)", "No"],
            ["1", "Pause", "Yes"],
            ["2", "Resume", "Yes"],
          ]}
        />

        {/* MCP Server Setup */}
        <SectionHeading id="mcp-setup">MCP Server Setup</SectionHeading>

        <Paragraph>
          The Fuin MCP server lets AI coding assistants (Claude Desktop, Cursor, Claude Code) interact with your vault directly. It exposes tools for balance checks, transfers, and swaps &mdash; all enforced by on-chain policies.
        </Paragraph>

        <SubHeading>Claude Desktop</SubHeading>
        <Paragraph>
          Add to <InlineCode>~/Library/Application Support/Claude/claude_desktop_config.json</InlineCode>:
        </Paragraph>
        <CodeBlock title="claude_desktop_config.json">{`{
  "mcpServers": {
    "fuin": {
      "command": "npx",
      "args": ["-y", "@fuin-labs/mcp-server"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>"
      }
    }
  }
}`}</CodeBlock>

        <SubHeading>Cursor / VS Code</SubHeading>
        <Paragraph>
          Add to <InlineCode>.cursor/mcp.json</InlineCode> or <InlineCode>.vscode/mcp.json</InlineCode>:
        </Paragraph>
        <CodeBlock title="mcp.json">{`{
  "servers": {
    "fuin": {
      "command": "npx",
      "args": ["-y", "@fuin-labs/mcp-server"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>"
      }
    }
  }
}`}</CodeBlock>

        <SubHeading>Claude Code (Local Dev)</SubHeading>
        <Paragraph>
          For local development, add the config to <InlineCode>.claude/settings.json</InlineCode> in the repo root:
        </Paragraph>
        <CodeBlock title=".claude/settings.json">{`{
  "mcpServers": {
    "fuin": {
      "command": "npx",
      "args": ["tsx", "packages/mcp-server/src/index.ts"],
      "cwd": "/absolute/path/to/fuin",
      "env": {
        "DELEGATE_PRIVATE_KEY": "<agent base58 secret key>",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com"
      }
    }
  }
}`}</CodeBlock>

        <SubHeading>Environment Variables</SubHeading>
        <Table
          headers={["Variable", "Required", "Default", "Description"]}
          rows={[
            ["`DELEGATE_PRIVATE_KEY`", "Yes", "\u2014", "Base58-encoded secret key of the delegate keypair"],
            ["`SOLANA_RPC_URL`", "No", "https://api.devnet.solana.com", "Solana RPC endpoint"],
          ]}
        />

        {/* Available Tools */}
        <SectionHeading id="available-tools">Available Tools</SectionHeading>

        <Paragraph>
          The MCP server exposes the following tools. All destructive operations are validated on-chain by the policy engine.
        </Paragraph>

        <Table
          headers={["Tool", "Description", "Type"]}
          rows={[
            ["`get-balance`", "Get vault SOL balance, state, spending caps, and program allow/deny lists", "Read-only"],
            ["`get-delegate-info`", "Get delegate permissions, limits, usage, expiry, and status", "Read-only"],
            ["`list-delegates`", "List all delegates issued to this agent's keypair", "Read-only"],
            ["`transfer-sol`", "Execute SOL transfer from vault using delegate permissions", "Destructive"],
            ["`transfer-spl`", "Execute SPL token transfer from vault. Supports Pyth price feeds for USD valuation", "Destructive"],
            ["`swap`", "Execute token swap on Meteora DLMM from vault. Requires DLMM program in allow-list", "Destructive"],
            ["`request-program`", "Request guardian to add a program to the vault's allow-list", "Request"],
          ]}
        />

        {/* Agent Actions */}
        <SectionHeading id="agent-actions">Agent Actions</SectionHeading>

        <SubHeading>SOL Transfer</SubHeading>
        <Paragraph>
          Once the MCP server is configured, ask your AI assistant to transfer SOL:
        </Paragraph>
        <CodeBlock title="Prompt">{`Transfer 0.01 SOL to <destination pubkey>`}</CodeBlock>
        <Paragraph>
          The assistant will use the <InlineCode>transfer-sol</InlineCode> tool. The on-chain policy engine enforces permissions and spending limits automatically.
        </Paragraph>

        <SubHeading>SPL Token Transfer</SubHeading>
        <Paragraph>
          First, ensure the vault has tokens. Fund it using the CLI:
        </Paragraph>
        <CodeBlock title="Terminal">{`# Send tokens to the vault ATA (creates it if needed)
spl-token transfer <MINT_ADDRESS> 500000 <VAULT_PDA> --fund-recipient`}</CodeBlock>
        <Paragraph>Then ask your assistant:</Paragraph>
        <CodeBlock title="Prompt">{`Transfer 1 token of mint <MINT_ADDRESS> to <destination pubkey>`}</CodeBlock>
        <Paragraph>
          The MCP server automatically creates the destination ATA if it doesn&apos;t exist.
        </Paragraph>

        <SubHeading>Swap (Meteora DLMM)</SubHeading>
        <Paragraph>
          Swaps require the <InlineCode>CAN_SWAP</InlineCode> permission and the Meteora DLMM program in the vault&apos;s allow-list. Ask your assistant:
        </Paragraph>
        <CodeBlock title="Prompt">{`Swap 1 token of mint <INPUT_MINT> on pool <POOL_ADDRESS> with 1% slippage`}</CodeBlock>
        <Paragraph>
          The policy engine validates the CAN_SWAP permission, checks spending limits, and verifies the target program is in the vault&apos;s allow-list.
        </Paragraph>

        {/* Policy Guardrails */}
        <SectionHeading id="policy-guardrails">Policy Guardrails</SectionHeading>

        <Paragraph>
          The on-chain policy engine enforces all constraints at the program level. Here are common failure scenarios that demonstrate the safety net:
        </Paragraph>

        <SubHeading>Exceed Spending Cap</SubHeading>
        <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-4 my-4">
          <div className="text-sm font-geist mb-2">
            <span className="text-white/40 mr-2">Prompt:</span>
            <span className="text-white/70">&quot;Transfer 100 SOL to &lt;destination&gt;&quot;</span>
          </div>
          <div className="text-sm font-geist">
            <span className="text-white/40 mr-2">Result:</span>
            <span className="text-rose-400 font-mono">DailyLimitExceeded</span>
          </div>
          <div className="text-xs text-white/40 font-geist mt-2">The delegate&apos;s spending cap is enforced per Solana epoch (~2-3 days on devnet).</div>
        </div>

        <SubHeading>Wrong Permission</SubHeading>
        <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-4 my-4">
          <div className="text-sm font-geist mb-2">
            <span className="text-white/40 mr-2">Setup:</span>
            <span className="text-white/70">Delegate has only <InlineCode>CAN_SWAP</InlineCode> (1), no <InlineCode>CAN_TRANSFER</InlineCode></span>
          </div>
          <div className="text-sm font-geist mb-2">
            <span className="text-white/40 mr-2">Prompt:</span>
            <span className="text-white/70">&quot;Transfer 0.1 SOL to &lt;destination&gt;&quot;</span>
          </div>
          <div className="text-sm font-geist">
            <span className="text-white/40 mr-2">Result:</span>
            <span className="text-rose-400 font-mono">PermissionDenied</span>
          </div>
        </div>

        <SubHeading>Paused Delegate</SubHeading>
        <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-4 my-4">
          <div className="text-sm font-geist mb-2">
            <span className="text-white/40 mr-2">Setup:</span>
            <span className="text-white/70">Guardian pauses the delegate from the dashboard (status = 1)</span>
          </div>
          <div className="text-sm font-geist mb-2">
            <span className="text-white/40 mr-2">Prompt:</span>
            <span className="text-white/70">Any action</span>
          </div>
          <div className="text-sm font-geist">
            <span className="text-white/40 mr-2">Result:</span>
            <span className="text-rose-400 font-mono">DelegateInactive</span>
          </div>
          <div className="text-xs text-white/40 font-geist mt-2">Pausing is reversible. Revoking (status = 0) is permanent.</div>
        </div>

        {/* Reference */}
        <SectionHeading id="reference">Reference</SectionHeading>

        <SubHeading>Program ID</SubHeading>
        <CodeBlock>{`E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy`}</CodeBlock>

        <SubHeading>PDA Derivation</SubHeading>
        <Table
          headers={["Account", "Seeds"]}
          rows={[
            ["Vault", '`["vault", guardian_pubkey, nonce_le_8bytes]`'],
            ["Delegate", '`["delegate", vault_pubkey, nonce_le_8bytes]`'],
          ]}
        />
        <Paragraph>
          Nonces are <InlineCode>BN</InlineCode> values serialized as 8-byte little-endian buffers: <InlineCode>nonce.toArrayLike(Buffer, &quot;le&quot;, 8)</InlineCode>
        </Paragraph>

        <SubHeading>Permission Bitmasks</SubHeading>
        <Table
          headers={["Permission", "Value", "Binary"]}
          rows={[
            ["`CAN_SWAP`", "1", "0001"],
            ["`CAN_TRANSFER`", "2", "0010"],
            ["`CAN_STAKE`", "4", "0100"],
            ["`CAN_LP`", "8", "1000"],
          ]}
        />
        <Paragraph>
          Combine permissions with bitwise OR. For example, <InlineCode>CAN_SWAP + CAN_TRANSFER = 3</InlineCode> (binary <InlineCode>0011</InlineCode>).
        </Paragraph>

        <SubHeading>Supported Pyth Price Feeds</SubHeading>
        <div className="flex flex-wrap gap-2 my-4">
          {["SOL/USD", "BTC/USD", "ETH/USD", "USDC/USD", "USDT/USD", "BONK/USD", "JUP/USD", "RAY/USD", "WIF/USD"].map(feed => (
            <span key={feed} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white/70">{feed}</span>
          ))}
        </div>

        <SubHeading>Program Instructions</SubHeading>
        <Table
          headers={["Instruction", "Description"]}
          rows={[
            ["`init_vault`", "Create a new vault PDA with initial policies"],
            ["`issue_delegate`", "Issue a delegate key with permissions, caps, and expiry"],
            ["`execute_transfer`", "SOL transfer from vault (policy-enforced)"],
            ["`execute_spl_transfer`", "SPL token transfer from vault (policy-enforced)"],
            ["`freeze_vault`", "Freeze all vault operations"],
            ["`unfreeze_vault`", "Resume vault operations"],
            ["`delegate_control`", "Pause, resume, or revoke a delegate"],
            ["`update_vault`", "Update vault policies (allowlists, caps)"],
            ["`withdraw`", "Guardian withdraws funds from vault"],
          ]}
        />

        <div className="mt-20 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40 font-geist">
            Built on Solana. Powered by Pyth Network and Helius.
          </p>
        </div>
      </main>
    </div>
  );
}
