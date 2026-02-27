"use client";

import { useEffect, useState } from "react";
import "./landing.css";
import { UsecaseFlow } from "./components/UsecaseFlow";
import Link from "next/link";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div id="landing-view" className="w-full transition-opacity duration-500">
      {/* Background Component */}
      <div className="aura-background-component -z-10 w-full h-[1040px] absolute top-0">
        <div data-us-project="vTTCp5g4cVl9nwjlT56Z" className="absolute w-full h-full left-0 top-0 -z-10"></div>
      </div>

      <header className="relative">
        <div className="sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pr-4 pl-4">
          {/* Nav */}
          <nav className="flex mt-6 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <iconify-icon icon="solar:shield-keyhole-linear" class="text-2xl text-emerald-400"></iconify-icon>
              <span className="text-xl font-semibold tracking-tight font-geist text-white">Fuin</span>
            </Link>

            <div className="hidden md:flex md:gap-x-2 bg-white/5 border-white/10 border rounded-full pt-1 pr-1 pb-1 pl-1 backdrop-blur-lg gap-x-2 gap-y-1 items-center">
              <Link href="#primitives" className="hover:text-white text-sm font-medium text-white/80 font-geist pt-2 pr-3 pb-2 pl-3 transition-colors">Primitives</Link>
              <Link href="#actors" className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white font-geist transition-colors">Actors</Link>
              <Link href="/dashboard/vaults" className="px-3 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 font-geist transition-colors">Launch App</Link>
              <div className="relative inline-block group text-xs rounded-full">
                <button className="animate-[slideInBlur_0.8s_ease-out_1.2s_forwards] relative z-10 overflow-hidden transition-[transform] duration-150 ease-out active:scale-[0.98] text-white bg-neutral-900/60 border-white/20 border pt-3 pr-6 pb-3 pl-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-xs rounded-full cursor-pointer">
                  <span className="relative z-10 inline-flex items-center gap-2 font-medium text-xs rounded-full font-geist">Read Docs</span>
                  <span className="pointer-events-none absolute bottom-0 left-1/2 right-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 transition-[left,right] duration-500 ease-out group-hover:left-0 group-hover:right-0 text-xs rounded-full"></span>
                </button>
              </div>
            </div>

            <button
              className="md:hidden inline-flex text-sm font-medium font-geist bg-white/5 border-white/10 border rounded-lg pt-2 pr-3 pb-2 pl-3 backdrop-blur gap-x-2 gap-y-2 items-center text-white/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <iconify-icon icon="solar:hamburger-menu-linear" class="text-lg"></iconify-icon>
              Menu
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 bg-black/95 border border-white/10 rounded-xl backdrop-blur-xl z-50">
              <div className="flex flex-col gap-4">
                <Link href="#primitives" className="text-white/80 font-geist" onClick={() => setMobileMenuOpen(false)}>Primitives</Link>
                <Link href="#actors" className="text-white/80 font-geist" onClick={() => setMobileMenuOpen(false)}>Actors</Link>
                <Link href="/dashboard/vaults" className="text-emerald-400 font-geist font-medium" onClick={() => setMobileMenuOpen(false)}>Launch App</Link>
              </div>
            </div>
          )}

          {/* Hero */}
          <section className="z-10 sm:pt-20 md:pt-48 md:pb-32 text-center max-w-5xl mr-auto ml-auto pt-20 pb-32 relative">

            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 [animation:fadeSlideIn_1s_ease-out_0.1s_both]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-medium font-geist">Solana IAM Protocol</span>
            </div>

            <h1 className="text-6xl sm:text-8xl md:text-[120px] font-bold [animation:fadeSlideIn_1s_ease-out_0.2s_forwards] tracking-tighter font-geist opacity-0 max-w-5xl mr-auto ml-auto text-white">
              Fuin
            </h1>

            <p className="sm:text-lg [animation:fadeSlideIn_1s_ease-out_0.3s_both] text-base font-normal text-white/70 font-geist max-w-2xl mt-6 mr-auto ml-auto">
              A programmable Identity Access Management layer and restrictive wallet protocol. Cryptographic seals for AI agents and new users, operating in a secure sandbox without sacrificing custody.
            </p>

            <div className="flex flex-col sm:flex-row [animation:fadeSlideIn_1s_ease-out_0.4s_both] mt-10 gap-x-4 gap-y-3 items-center justify-center">
              <Link href="/dashboard/vaults" className="group relative inline-flex min-w-[160px] cursor-pointer transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:-translate-y-[3px] hover:text-white shadow-[0_2.8px_2.2px_rgba(0,0,0,0.3),_0_6.7px_5.3px_rgba(0,0,0,0.35),_0_12.5px_10px_rgba(0,0,0,0.4)] overflow-hidden font-medium text-black tracking-tight bg-emerald-400 rounded-full pt-[14px] pr-[24px] pb-[14px] pl-[24px] items-center justify-center no-underline">
                <span className="relative z-10 font-medium rounded-full font-geist">Launch App</span>
                <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[1px] w-[70%] -translate-x-1/2 transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] group-hover:opacity-80 bg-gradient-to-r from-transparent via-white to-transparent rounded-full blur-[2px]"></span>
              </Link>
              <button className="inline-flex items-center gap-2 hover:bg-white/10 text-base font-medium text-white/90 bg-white/5 border-white/10 border rounded-full pt-[14px] pr-[24px] pb-[14px] pl-[24px] backdrop-blur font-geist transition-colors">
                <iconify-icon icon="solar:code-circle-linear" class="text-lg"></iconify-icon>
                View GitHub
              </button>
            </div>
          </section>
        </div>
      </header>

      {/* Integrations */}
      <section className="z-10 sm:px-6 lg:px-8 max-w-7xl mt-12 mr-auto ml-auto pr-6 pb-16 pl-6 relative">
        <p className="[animation:fadeSlideIn_1s_ease-out_0.5s_both] text-sm font-medium text-white/40 text-center mb-6 font-geist tracking-wide uppercase">Powered by</p>
        <div className="flex flex-wrap gap-x-12 gap-y-8 items-center justify-center [animation:fadeSlideIn_1s_ease-out_0.6s_both] opacity-50 grayscale">
          <span className="text-xl font-medium font-geist flex items-center gap-2"><iconify-icon icon="solar:cpu-bold-duotone"></iconify-icon> Solana</span>
          <span className="text-xl font-medium font-geist flex items-center gap-2"><iconify-icon icon="solar:chart-bold-duotone"></iconify-icon> Pyth Network</span>
          <span className="text-xl font-medium font-geist flex items-center gap-2"><iconify-icon icon="solar:bolt-circle-bold-duotone"></iconify-icon> Helius</span>
        </div>
      </section>

      {/* Value section */}
      <section className="overflow-hidden relative border-t border-white/5 bg-white/[0.02]">
        <div className="sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pt-24 pr-6 pb-24 pl-6">
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 items-center">
            <div className="">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 mb-6 animate-on-scroll">
                <span className="text-xs font-medium font-geist tracking-wide">THE PROBLEM</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl [animation:fadeSlideIn_1s_ease-out_0.1s_both] animate-on-scroll font-geist tracking-tighter text-white">Delegation shouldn't mean losing custody.</h2>
              <p className="mt-6 text-base text-white/60 leading-relaxed [animation:fadeSlideIn_1s_ease-out_0.2s_both] animate-on-scroll font-geist">Traditional wallets operate on an all-or-nothing model. Fuin introduces - a programmable layer that lets you issue highly restricted session keys to AI agents or human delegates. They can transact on your behalf, but only within the exact boundaries you define.</p>
              <div className="flex [animation:fadeSlideIn_1s_ease-out_0.3s_both] animate-on-scroll mt-8 gap-x-3 gap-y-3 items-center">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-white/80 font-geist"><iconify-icon icon="solar:check-circle-linear" class="text-emerald-400 text-lg"></iconify-icon> Prevent AI hallucination-led exploits</li>
                  <li className="flex items-center gap-3 text-sm text-white/80 font-geist"><iconify-icon icon="solar:check-circle-linear" class="text-emerald-400 text-lg"></iconify-icon> Zero gas fees for delegates (Relayer pays)</li>
                  <li className="flex items-center gap-3 text-sm text-white/80 font-geist"><iconify-icon icon="solar:check-circle-linear" class="text-emerald-400 text-lg"></iconify-icon> Revoke access instantly on-chain</li>
                </ul>
              </div>
            </div>
            <div className="[animation:fadeSlideIn_1s_ease-out_0.4s_both] animate-on-scroll relative">
              <div className="aspect-square w-full rounded-2xl border border-white/10 bg-black/50 p-6 relative overflow-hidden flex flex-col">
                {/* Decorative grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Mock UI */}
                <div className="relative z-10 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-sm font-medium font-geist text-white">Vault Configurations</span>
                    <iconify-icon icon="solar:shield-check-bold-duotone" class="text-2xl text-emerald-400"></iconify-icon>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50 font-geist uppercase">Delegate</span>
                      <span className="text-xs text-emerald-400 font-geist bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>
                    </div>
                    <div className="text-sm text-white font-geist font-medium">Trading Bot (Agent)</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-white/5">
                        <div className="text-[10px] text-white/40 mb-1 font-geist">Cap</div>
                        <div className="text-xs text-white font-geist">20 SOL / Day</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-white/5">
                        <div className="text-[10px] text-white/40 mb-1 font-geist">Allowed</div>
                        <div className="text-xs text-white font-geist truncate">Jupiter, Meteora</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm opacity-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50 font-geist uppercase">Delegate</span>
                      <span className="text-xs text-rose-400 font-geist bg-rose-400/10 px-2 py-0.5 rounded">Revoked</span>
                    </div>
                    <div className="text-sm text-white font-geist font-medium">Junior Wallet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features (Primitives) */}
      <section className="z-10 sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-20 pl-6 relative" id="primitives">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-geist tracking-tighter text-white [animation:fadeSlideIn_1s_ease-out_0.2s_both] animate-on-scroll">Core Primitives</h2>
            <p className="mt-4 text-base text-white/60 font-geist max-w-2xl [animation:fadeSlideIn_1s_ease-out_0.3s_both] animate-on-scroll">A robust, composable architecture designed for security, auditability, and seamless meta-transactions on Solana.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 gap-x-4 gap-y-4">
          {/* Big feature */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2 md:row-span-2 [animation:fadeSlideIn_1s_ease-out_0.4s_both] animate-on-scroll hover:bg-white/[0.07] transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="p-6 sm:p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center">
                  <iconify-icon icon="solar:code-square-linear" class="text-xl text-white/80"></iconify-icon>
                </div>
                <span className="text-xs text-white/50 font-geist tracking-widest uppercase">Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-geist tracking-tighter text-white">On-chain Policy Engine</h3>
              <p className="mt-3 text-sm sm:text-base text-white/60 font-geist max-w-md">The heart of Fuin. A modular system enforcing constraints before execution. Guardians can compose rules using distinct modules.</p>

              <div className="mt-8 grid grid-cols-2 gap-3 flex-1">
                <div className="bg-black/50 border border-white/5 rounded-xl p-4">
                  <div className="text-emerald-400 text-sm mb-1 font-medium font-geist">Spending Module</div>
                  <div className="text-xs text-white/50 font-geist">Enforce daily caps and token whitelists. Verifies via Pyth/Switchboard oracles.</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4">
                  <div className="text-emerald-400 text-sm mb-1 font-medium font-geist">Program Module</div>
                  <div className="text-xs text-white/50 font-geist">Strict allowlists for target programs (CPIs) preventing malicious interaction.</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4">
                  <div className="text-emerald-400 text-sm mb-1 font-medium font-geist">Time Module</div>
                  <div className="text-xs text-white/50 font-geist">Epoch-based rate limits and expiration logic for temporary sessions.</div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-xl p-4">
                  <div className="text-emerald-400 text-sm mb-1 font-medium font-geist">Risk Module</div>
                  <div className="text-xs text-white/50 font-geist">Max slippage controls and anomaly detection for DeFi operations.</div>
                </div>
              </div>
            </div>
          </div>



          {/* Right column */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 [animation:fadeSlideIn_1s_ease-out_0.6s_both] animate-on-scroll p-6 hover:bg-white/[0.07] transition-colors">
            <iconify-icon icon="solar:gas-station-linear" class="text-2xl text-emerald-400 mb-4 opacity-80"></iconify-icon>
            <h3 className="text-xl font-medium tracking-tight text-white font-geist">
              GasTank PDA
            </h3>
            <p className="mt-2 text-sm text-white/60 font-geist">Guardians fund a central PDA. The protocol automatically refunds Relayers for gas upon successful intent execution.</p>
          </div>

          {/* Bottom small */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 [animation:fadeSlideIn_1s_ease-out_0.1s_both] animate-on-scroll p-6 hover:bg-white/[0.07] transition-colors">
            <iconify-icon icon="solar:routing-linear" class="text-2xl text-white/60 mb-3"></iconify-icon>
            <h3 className="text-lg font-medium tracking-tight text-white font-geist">
              Deterministic Routing
            </h3>
            <p className="mt-2 text-sm text-white/60 font-geist">Agents are restricted to predefined `Route` enums (e.g., JupiterSwap, MeteoraLP) to guarantee execution paths.</p>
          </div>

          {/* Bottom small */}
          <div className="overflow-hidden bg-white/5 border-white/10 border rounded-2xl relative [animation:fadeSlideIn_1s_ease-out_0.2s_both] animate-on-scroll p-6 hover:bg-white/[0.07] transition-colors">
            <iconify-icon icon="solar:shield-warning-linear" class="text-2xl text-white/60 mb-3"></iconify-icon>
            <h3 className="text-lg font-medium tracking-tight text-white font-geist">
              Replay Protection
            </h3>
            <p className="mt-2 text-sm text-white/60 font-geist">Every meta-transaction enforces a monotonic nonce counter to prevent duplicate intent submissions.</p>
          </div>

          {/* Bottom small */}
          <div className="overflow-hidden bg-white/5 border-white/10 border rounded-2xl relative [animation:fadeSlideIn_1s_ease-out_0.3s_both] animate-on-scroll p-6 hover:bg-white/[0.07] transition-colors">
            <iconify-icon icon="solar:pen-new-square-linear" class="text-2xl text-white/60 mb-3"></iconify-icon>
            <h3 className="text-lg font-medium tracking-tight text-white font-geist">
              ed25519 Intents
            </h3>
            <p className="mt-2 text-sm text-white/60 font-geist">ERC-4337 style meta-transactions. Users sign intents off-chain, verifying signatures natively on execution.</p>
          </div>
        </div>
      </section>

      {/* Web3 For Everyone - UsecaseFlow injected here */}
      <UsecaseFlow />

      {/* System Actors */}
      <section id="actors" className="relative z-10 py-24 md:py-32 px-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4 text-xs font-medium tracking-[0.2em] uppercase text-emerald-400 mb-6">
          <div className="w-6 h-[1px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
          Network Participants
        </div>

        <h2 className="font-geist text-4xl md:text-5xl font-bold tracking-tight mb-16 text-white">
          System Actors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-[320px] md:auto-rows-[340px] gap-4 md:gap-6">
          {/* Actor 1 */}
          <a href="#" className="group relative rounded-2xl overflow-hidden block border border-white/[0.04]">
            <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&amp;q=80" alt="Guardian" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 transition-transform duration-[1.5s] ease-out group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10">
              <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-emerald-400 mb-3 font-geist">The Owner</span>
              <h3 className="font-geist text-2xl md:text-3xl font-medium tracking-tight text-white flex items-center justify-between mb-2">
                Guardian
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-2xl text-emerald-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out"></iconify-icon>
              </h3>
              <p className="text-xs text-[#aaa] font-light max-w-sm font-geist">Creates vaults, sets strict policies, deposits gas, and retains ultimate control to freeze or rotate keys.</p>
            </div>
          </a>

          {/* Actor 2 */}
          <a href="#" className="group relative rounded-2xl overflow-hidden block border border-white/[0.04]">
            <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&amp;q=80" alt="Junior" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 transition-transform duration-[1.5s] ease-out group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10">
              <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-emerald-400 mb-3 font-geist">The Beginner</span>
              <h3 className="font-geist text-2xl md:text-3xl font-medium tracking-tight text-white flex items-center justify-between mb-2">
                Junior
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-2xl text-emerald-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out"></iconify-icon>
              </h3>
              <p className="text-xs text-[#aaa] font-light max-w-sm font-geist">A human operator acting under daily allowances, spending limits, and strict program whitelists.</p>
            </div>
          </a>

          {/* Actor 3 */}
          <a href="#" className="group relative rounded-2xl overflow-hidden block border border-white/[0.04]">
            <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&amp;q=80" alt="Agent" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 transition-all duration-[1.5s] ease-out group-hover:scale-105 group-hover:grayscale-0" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10">
              <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-emerald-400 mb-3 font-geist">The Autonomous Bot</span>
              <h3 className="font-geist text-2xl md:text-3xl font-medium tracking-tight text-white flex items-center justify-between mb-2">
                Agent
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-2xl text-emerald-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out"></iconify-icon>
              </h3>
              <p className="text-xs text-[#aaa] font-light max-w-sm font-geist">An AI operator cryptographically locked to predefined audited routes to prevent exploits driven by hallucination.</p>
            </div>
          </a>

          {/* Actor 4 */}
          <a href="#" className="group relative rounded-2xl overflow-hidden block border border-white/[0.04]">
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&amp;q=80" alt="Relayer" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 transition-all duration-[1.5s] ease-out group-hover:scale-105 group-hover:grayscale-0" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10">
              <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-emerald-400 mb-3 font-geist">The Courier</span>
              <h3 className="font-geist text-2xl md:text-3xl font-medium tracking-tight text-white flex items-center justify-between mb-2">
                Relayer
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-2xl text-emerald-400 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out"></iconify-icon>
              </h3>
              <p className="text-xs text-[#aaa] font-light max-w-sm font-geist">A non-custodial entity that packages and submits intents to the network, automatically receiving gas refunds.</p>
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="xl:mt-0 border-white/10 border-t relative bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <iconify-icon icon="solar:shield-keyhole-linear" class="text-xl text-white/80"></iconify-icon>
                <span className="text-lg font-semibold tracking-tight font-geist text-white">Fuin</span>
              </Link>
              <p className="text-sm text-white/50 max-w-sm font-geist leading-relaxed">Fuin is a programmable Identity Access Management (IAM) layer and restrictive wallet protocol built natively for the Solana VM.</p>
              <div className="mt-6 flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 font-geist transition-colors">
                  <iconify-icon icon="solar:document-text-linear" class="text-lg"></iconify-icon>
                  Read Documentation
                </button>
              </div>
            </div>

            <div className="">
              <h4 className="text-xs font-semibold tracking-widest uppercase text-white/80 font-geist mb-4">Protocol</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><Link href="/dashboard/vaults" className="hover:text-white transition-colors font-geist text-emerald-400 hover:text-emerald-300">Launch App</Link></li>
                <li><Link href="#primitives" className="hover:text-white transition-colors font-geist">Architecture</Link></li>
                <li><Link href="#actors" className="hover:text-white transition-colors font-geist">Actors</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors font-geist">GitHub</Link></li>
              </ul>
            </div>

            <div className="">
              <h4 className="text-xs font-semibold tracking-widest uppercase text-white/80 font-geist mb-4">Community</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><Link href="https://x.com/Jayant818x" target="_blank" className="hover:text-white transition-colors font-geist flex items-center gap-2"><iconify-icon icon="solar:bird-linear"></iconify-icon> Twitter / X</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            <p className="text-xs text-white/40 font-geist">© <span className="font-geist">{currentYear}</span> Fuin Protocol. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-white/40 font-geist">
              <span>Mainnet-beta (Coming Soon)</span>
              <span className="w-1 h-1 rounded-full bg-white/20 my-auto"></span>
              <span className="text-emerald-400">Devnet Live</span>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
}
