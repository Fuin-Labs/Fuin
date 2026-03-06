"use client";

import { motion, AnimatePresence } from "framer-motion";
import { JSX, useState } from "react";
import { Shield, Sparkles, Zap, Lock, Activity, Bot } from "lucide-react";

// --- Animated OpenClaw Agent SVG Component ---
const AnimatedOpenClaw = () => (
    <motion.div
        style={{ width: "100%", height: "100%", maxWidth: "300px", padding: "20px" }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0px 0px 20px rgba(255, 77, 77, 0.4))" }}>
            <defs>
                <linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
            </defs>

            {/* Body - Breathing Animation */}
            <motion.path
                d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
                fill="url(#lobster-gradient)"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: "50%", originY: "50%" }}
            />

            {/* Left Claw - Clamping */}
            <motion.path
                d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
                fill="url(#lobster-gradient)"
                animate={{ rotate: [0, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                style={{ originX: "25px", originY: "55px" }}
            />

            {/* Right Claw - Clamping */}
            <motion.path
                d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
                fill="url(#lobster-gradient)"
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 0.2 }}
                style={{ originX: "95px", originY: "55px" }}
            />

            {/* Antenna */}
            <path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />
            <path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />

            {/* Eye Backgrounds */}
            <circle cx="45" cy="35" r="6" fill="#050810" />
            <circle cx="75" cy="35" r="6" fill="#050810" />

            {/* Glowing Pupils - Scanning */}
            <motion.circle
                cx="46" cy="34" r="2.5" fill="#34d399"
                animate={{ cx: [44, 48, 44], cy: [34, 34, 34] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px #34d399)" }}
            />
            <motion.circle
                cx="76" cy="34" r="2.5" fill="#34d399"
                animate={{ cx: [74, 78, 74], cy: [34, 34, 34] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px #34d399)" }}
            />
        </svg>
    </motion.div>
);


// --- Flow Step Card Component ---
const FlowStepCard = ({ step, title, desc, icon, delay, accentColor }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay }}
            className="flex gap-5 p-6 bg-[#0f0f0f] border border-[rgba(255,255,255,0.1)] rounded-2xl relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-colors"
        >
            {/* Accent left bar */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                backgroundColor: accentColor,
            }} />

            <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                backgroundColor: `${accentColor}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${accentColor}30`,
                flexShrink: 0
            }}>
                {icon}
            </div>

            <div className="font-geist">
                <div style={{ color: accentColor }} className="text-xs font-pixel tracking-[0.1em] uppercase mb-1">
                    Phase 0{step}
                </div>
                <h4 className="text-white text-xl font-bold m-0 mb-2 font-geist">
                    {title}
                </h4>
                <p className="text-white/60 text-[0.95rem] leading-relaxed m-0 font-geist">
                    {desc}
                </p>
            </div>
        </motion.div>
    );
}

// --- Main UsecaseFlow Component ---
export const UsecaseFlow = (): JSX.Element => {
    const [activeTab, setActiveTab] = useState<"agent" | "junior">("agent");

    return (
        <section id="usecase-flow" className="relative z-10 w-full py-28 md:py-32 px-6 flex flex-col items-center font-geist overflow-hidden">
            <div className="section-divider w-full absolute top-0 left-0"></div>

            {/* Header / Toggle Section */}
            <div className="max-w-4xl w-full z-10 text-center mb-16">
                <span className="font-pixel text-[11px] text-white/50 tracking-widest uppercase mb-6 block">Usecases</span>
                <h2 className="text-section font-geist text-white mb-8">
                    Web3 For <span className={activeTab === "agent" ? "text-rose-400" : "text-emerald-400"} style={{ transition: "color 0.4s ease" }}>Everyone</span>
                </h2>

                {/* Toggle Switch */}
                <div className="inline-flex bg-[#0f0f0f] border border-[rgba(255,255,255,0.1)] rounded-full p-1.5 relative">
                    <button
                        onClick={() => setActiveTab("agent")}
                        className={`px-4 py-2.5 sm:px-8 sm:py-3 rounded-full border-none text-base font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 ${activeTab === "agent" ? 'bg-rose-500/15 text-rose-400' : 'bg-transparent text-white/60'}`}
                    >
                        <Bot size={18} />
                        Autonomous Agents
                    </button>
                    <button
                        onClick={() => setActiveTab("junior")}
                        className={`px-4 py-2.5 sm:px-8 sm:py-3 rounded-full border-none text-base font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 ${activeTab === "junior" ? 'bg-emerald-400/15 text-emerald-400' : 'bg-transparent text-white/60'}`}
                    >
                        <Shield size={18} />
                        Junior Vaults
                    </button>
                </div>
            </div>

            {/* Dynamic Content Container */}
            <div className="max-w-[1200px] w-full min-h-[500px] relative">
                <AnimatePresence mode="wait">

                    {/* --- OPENCLAW AGENT FLOW --- */}
                    {activeTab === "agent" && (
                        <motion.div
                            key="agent-flow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center"
                        >
                            {/* Left: Graphic Visualization — hidden on mobile, shown second on md+ */}
                            <div className="hidden md:flex relative h-[400px] items-center justify-center">
                                <AnimatedOpenClaw />
                            </div>

                            {/* Right: Flow Steps */}
                            <div className="flex flex-col gap-5">
                                <FlowStepCard
                                    step={1}
                                    title="Awaken via Webhook"
                                    desc="Guardian deposits funds into the PDA. Helius Geyser webhook fires immediately, pinging the sandboxed agent: 'You have liquidity.'"
                                    icon={<Activity color="#ff4d4d" />}
                                    delay={0.1}
                                    accentColor="#ff4d4d"
                                />
                                <FlowStepCard
                                    step={2}
                                    title="Acquire Scoped Session"
                                    desc="Agent receives a cryptographic session key bound strictly to predefined Routes (Capability Routing). It cannot compose custom transactions."
                                    icon={<Lock color="#ff4d4d" />}
                                    delay={0.3}
                                    accentColor="#ff4d4d"
                                />
                                <FlowStepCard
                                    step={3}
                                    title="Execute Verified Intent"
                                    desc="Agent signs an intent (e.g., 'Swap SOL for USDC'). A centralized Relayer executes the meta-transaction, covering gas. Policy engine validates rules on-chain."
                                    icon={<Zap color="#ff4d4d" />}
                                    delay={0.5}
                                    accentColor="#ff4d4d"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* --- JUNIOR / TEENAGER FLOW --- */}
                    {activeTab === "junior" && (
                        <motion.div
                            key="junior-flow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center"
                        >
                            {/* Left: Graphic Visualization — hidden on mobile */}
                            <div className="hidden md:flex relative h-[400px] items-center justify-center">
                                {/* Holographic Shield Animation */}
                                <motion.div
                                    animate={{ y: [-15, 15, -15], scale: [1, 1.05, 1] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Shield size={180} color="#34d399" strokeWidth={1} style={{ filter: "drop-shadow(0 0 30px rgba(52,211,153,0.5))" }} />
                                    <Sparkles size={40} color="#FACC15" style={{ position: "absolute", top: -10, right: -10 }} />
                                </motion.div>
                            </div>

                            {/* Right: Flow Steps */}
                            <div className="flex flex-col gap-5">
                                <FlowStepCard
                                    step={1}
                                    title="Parental Vault Setup"
                                    desc="Parent deploys a smart PDA vault. They establish the PolicySet: a strict $20 daily limit, and a whitelist of approved dApps (e.g., specific games or DEXs)."
                                    icon={<Shield color="#34d399" />}
                                    delay={0.1}
                                    accentColor="#34d399"
                                />
                                <FlowStepCard
                                    step={2}
                                    title="Invisible Delegation"
                                    desc="The junior user is silently issued a time-bound Session Key. Their frontend interactions feel identical to Web2, without pop-ups or seed phrase risks."
                                    icon={<Zap color="#34d399" />}
                                    delay={0.3}
                                    accentColor="#34d399"
                                />
                                <FlowStepCard
                                    step={3}
                                    title="Sponsored Execution"
                                    desc="When trading or playing, a Relayer pushes the transaction. Gas is sponsored by the Parent's GasTank. The on-chain policy verifies limits mathematically."
                                    icon={<Activity color="#34d399" />}
                                    delay={0.5}
                                    accentColor="#34d399"
                                />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </section>
    );
};
