# Fuin — Launch Video Explanation Prompt

> A self-contained explanation of Fuin for a video-generation tool. Substance only: what it is, what it does, and its features. No scene direction.

## What it is

Fuin is a programmable authorization layer on Solana. It lets anyone hand out a key to their wallet that can spend within strict, on-chain rules — and can never drain the account. Instead of the usual all-or-nothing choice (hold your keys yourself, or hand them over completely), Fuin gives you a third option: grant the power to act while withholding the power to drain.

## The problem it solves

Every crypto wallet today is all-or-nothing. One bad signature, one compromised bot, or one prompt-injected AI agent can take everything. As people start delegating money to autonomous agents, teammates, and sub-accounts, that's a fatal flaw. The next wave of crypto isn't more access — it's restricted access.

## What it does

A guardian creates an on-chain vault and issues scoped keys from it to anyone: an AI trading agent, a contractor, or a kid. Each key carries the guardian's rules — how much it can spend, how often, where funds can go, which programs it can touch, and for how long. The key-holder can act freely within those limits. Crossing them is mathematically impossible, because every action is validated on-chain by the program before it settles, not enforced by trust.

## Key features

- **Scoped delegate keys** — issue a key with a spending cap, a program allow-list, a time window, and granular bitmask permissions (swap, transfer, stake, LP).
- **Hard caps** — per-transaction and rolling spend limits the key can never exceed.
- **Allow-lists** — funds move only to the destinations and programs you approve.
- **Instant revoke** — kill any key on-chain, in one click, permanently.
- **Intent inheritance for agent swarms** — sign one root intent (an agent, a budget, a predicate, an expiry), and any agent operating under it can derive a child intent for a sub-agent, but only a strictly tighter one. At execution, an on-chain ancestor walk checks the action against the intent and every ancestor above it, so no layer can ever widen what it inherited. One signature, infinite agents, fixed downside.
- **Gasless execution** — a relayer can submit transactions and sponsor gas, so delegated users and agents interact like Web2, with no pop-ups or seed-phrase risk.

## Who it's for

Developers shipping money-touching AI agents on Solana, anyone delegating funds to an automated system, teams giving scoped spending access, and parents giving a kid a wallet that can't be drained.

Fuin is live on Solana.
