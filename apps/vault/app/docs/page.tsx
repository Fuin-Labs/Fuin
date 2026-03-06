"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import "../landing.css";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "connect-agent", label: "Connect Your AI Agent" },
  { id: "available-tools", label: "Available Tools" },
  { id: "what-agents-can-do", label: "What Agents Can Do" },
  { id: "policy-guardrails", label: "Policy Guardrails" },
  { id: "manage-delegates", label: "Managing Delegates" },
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
          Fuin is a programmable authorization layer on Solana. It lets you create on-chain vaults, deposit funds, and issue scoped delegate keys to AI agents &mdash; with spending caps, permission controls, and policy constraints enforced entirely on-chain.
        </Paragraph>
        <Paragraph>
          Your agent can transfer SOL, send SPL tokens, and execute swaps &mdash; but only within the boundaries you set. You stay in control.
        </Paragraph>

        <SubHeading>How It Works</SubHeading>

        <div className="grid gap-3 my-6">
          {[
            { title: "1. Create a Vault", desc: "Connect your wallet and create an on-chain vault. This is a PDA that holds your funds and enforces all policies." },
            { title: "2. Fund the Vault", desc: "Send SOL (or SPL tokens) to your vault address. The vault is the source of all agent transactions." },
            { title: "3. Issue a Delegate Key", desc: "Generate a keypair for your AI agent and issue a delegate with specific permissions, spending limits, and expiry." },
            { title: "4. Connect Your Agent", desc: "Configure the Fuin MCP server in your AI client (Claude, Cursor, etc.) with the delegate private key. The agent can now operate within your policy constraints." },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-[#0f0f0f] p-4">
              <div className="text-sm font-medium font-geist text-white mb-1">{title}</div>
              <div className="text-sm text-white/50 font-geist">{desc}</div>
            </div>
          ))}
        </div>

        {/* Getting Started */}
        <SectionHeading id="getting-started">Getting Started</SectionHeading>

        <SubHeading>What You Need</SubHeading>
        <ul className="list-disc list-inside text-white/70 font-geist space-y-2 mb-6">
          <li>A Solana wallet (Phantom, Solflare, etc.) set to <strong className="text-white">Devnet</strong></li>
          <li>Some devnet SOL &mdash; use a <a href="https://faucet.solana.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">faucet</a> or <InlineCode>solana airdrop 2</InlineCode></li>
          <li>Node.js 18+ installed (for running the MCP server)</li>
        </ul>

        <SubHeading>Step 1: Create a Vault</SubHeading>
        <ol className="list-decimal list-inside text-white/70 font-geist space-y-3 mb-6">
          <li>Go to the <Link href="/dashboard/vaults" className="text-emerald-400 hover:underline">Fuin Dashboard</Link></li>
          <li>Connect your wallet (make sure it&apos;s set to Devnet)</li>
          <li>Click <strong className="text-white">Create Vault</strong></li>
          <li>Your vault PDA address will be displayed &mdash; copy it</li>
        </ol>

        <SubHeading>Step 2: Fund the Vault</SubHeading>
        <Paragraph>
          Send SOL to your vault PDA address from your wallet. The vault is the source of all agent transactions.
        </Paragraph>

        <SubHeading>Step 3: Generate an Agent Keypair</SubHeading>
        <Paragraph>
          Your AI agent needs its own keypair. The public key gets registered as a delegate, and the private key is used by the MCP server to sign transactions.
        </Paragraph>
        <CodeBlock title="Terminal">{`# Generate a new keypair for your agent
solana-keygen new -o agent-key.json

# Note the public key — you'll paste it when issuing the delegate
solana address -k agent-key.json

# Get the base58 private key (needed for MCP server config)
node -e "
const bs58 = require('bs58');
const raw = require('./agent-key.json');
console.log(bs58.encode(Buffer.from(raw)));
"

# Fund the agent wallet (it pays transaction fees)
solana airdrop 1 $(solana address -k agent-key.json)`}</CodeBlock>

        <SubHeading>Step 4: Issue a Delegate</SubHeading>
        <ol className="list-decimal list-inside text-white/70 font-geist space-y-3 mb-6">
          <li>Go to your vault in the <Link href="/dashboard/vaults" className="text-emerald-400 hover:underline">Dashboard</Link></li>
          <li>Click <strong className="text-white">Issue Delegate</strong></li>
          <li>Paste the agent&apos;s public key</li>
          <li>Choose permissions (e.g. Transfer, Swap)</li>
          <li>Set a spending cap and expiry</li>
          <li>Submit &mdash; the delegate is created on-chain</li>
        </ol>
        <Paragraph>
          After creation, the dashboard shows a <strong className="text-white">Quick Start</strong> card with the exact MCP config to copy into your AI client.
        </Paragraph>

        {/* Connect Your AI Agent */}
        <SectionHeading id="connect-agent">Connect Your AI Agent</SectionHeading>

        <Paragraph>
          The Fuin MCP server lets AI coding assistants (Claude Desktop, Cursor, Claude Code) interact with your vault directly. It exposes tools for balance checks, transfers, and swaps &mdash; all enforced by on-chain policies.
        </Paragraph>

        <Paragraph>
          Install via npm &mdash; no server to deploy. The MCP server runs locally on the user&apos;s machine and communicates via stdio.
        </Paragraph>
        <CodeBlock title="Install">{`npx -y @fuin-labs/mcp-server`}</CodeBlock>

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
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com"
      }
    }
  }
}`}</CodeBlock>

        <SubHeading>Claude Code</SubHeading>
        <Paragraph>
          Add to <InlineCode>.claude/settings.json</InlineCode> in your project root:
        </Paragraph>
        <CodeBlock title=".claude/settings.json">{`{
  "mcpServers": {
    "fuin": {
      "command": "npx",
      "args": ["-y", "@fuin-labs/mcp-server"],
      "env": {
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com"
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
        "DELEGATE_PRIVATE_KEY": "<base58-encoded-secret-key>",
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

        {/* What Agents Can Do */}
        <SectionHeading id="what-agents-can-do">What Agents Can Do</SectionHeading>

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

        {/* Managing Delegates */}
        <SectionHeading id="manage-delegates">Managing Delegates</SectionHeading>

        <Paragraph>
          From the <Link href="/dashboard/vaults" className="text-emerald-400 hover:underline">Guardian Dashboard</Link> you can pause, resume, or permanently revoke delegates at any time.
        </Paragraph>
        <Table
          headers={["Code", "Action", "Reversible"]}
          rows={[
            ["0", "Revoke (permanent)", "No"],
            ["1", "Pause", "Yes"],
            ["2", "Resume", "Yes"],
          ]}
        />
        <Paragraph>
          Pausing a delegate immediately blocks all actions. The guardian can resume later. Revoking is permanent &mdash; the delegate key can never be reactivated.
        </Paragraph>

        {/* Reference */}
        <SectionHeading id="reference">Reference</SectionHeading>

        <SubHeading>Network</SubHeading>
        <Paragraph>
          Fuin is currently live on <strong className="text-white">Solana Devnet</strong>. Make sure your wallet and RPC are set to devnet.
        </Paragraph>

        <SubHeading>Permissions</SubHeading>
        <Table
          headers={["Permission", "What It Allows"]}
          rows={[
            ["`CAN_SWAP`", "Token swaps on approved DEX programs"],
            ["`CAN_TRANSFER`", "SOL and SPL token transfers to any address"],
            ["`CAN_STAKE`", "Staking operations (coming soon)"],
            ["`CAN_LP`", "Liquidity provision (coming soon)"],
          ]}
        />
        <Paragraph>
          Permissions are combined. For example, a delegate with <InlineCode>CAN_SWAP + CAN_TRANSFER</InlineCode> can do both.
        </Paragraph>

        <SubHeading>Supported Price Feeds</SubHeading>
        <Paragraph>
          SPL token transfers use Pyth oracle price feeds for USD valuation:
        </Paragraph>
        <div className="flex flex-wrap gap-2 my-4">
          {["SOL/USD", "BTC/USD", "ETH/USD", "USDC/USD", "USDT/USD", "BONK/USD", "JUP/USD", "RAY/USD", "WIF/USD"].map(feed => (
            <span key={feed} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white/70">{feed}</span>
          ))}
        </div>

        <SubHeading>SDK (for developers)</SubHeading>
        <Paragraph>
          Building a custom integration? The SDK is available on npm:
        </Paragraph>
        <CodeBlock title="Install">{`npm install @fuin-labs/sdk`}</CodeBlock>
        <Paragraph>
          See the <a href="https://github.com/Fuin-Labs/Fuin" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">GitHub repository</a> for SDK documentation and examples.
        </Paragraph>

        <SubHeading>Program ID</SubHeading>
        <CodeBlock>{`E6GkTAh6m3DacsKuUKQ64gn85mZof4D96dTNPLQAoSiy`}</CodeBlock>

        <div className="mt-20 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40 font-geist">
            Built on Solana. Powered by Pyth Network and Helius.
          </p>
        </div>
      </main>
    </div>
  );
}
