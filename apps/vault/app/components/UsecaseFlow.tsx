"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
                style={{ originX: "25px", originY: "55px" }} // Hinge point
            />

            {/* Right Claw - Clamping */}
            <motion.path
                d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
                fill="url(#lobster-gradient)"
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 0.2 }}
                style={{ originX: "95px", originY: "55px" }} // Hinge point
            />

            {/* Antenna */}
            <path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />
            <path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round" />

            {/* Eye Backgrounds */}
            <circle cx="45" cy="35" r="6" fill="#050810" />
            <circle cx="75" cy="35" r="6" fill="#050810" />

            {/* Glowing Pupils - Scanning */}
            <motion.circle
                cx="46" cy="34" r="2.5" fill="#00e5cc"
                animate={{ cx: [44, 48, 44], cy: [34, 34, 34] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px #00e5cc)" }}
            />
            <motion.circle
                cx="76" cy="34" r="2.5" fill="#00e5cc"
                animate={{ cx: [74, 78, 74], cy: [34, 34, 34] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px #00e5cc)" }}
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
            style={{
                display: "flex",
                gap: "20px",
                padding: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "20px",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Ambient accent glow behind the card */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                backgroundColor: accentColor,
                boxShadow: `0 0 15px ${accentColor}`
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

            <div>
                <div style={{ color: accentColor, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Phase 0{step}
                </div>
                <h4 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0" }}>
                    {title}
                </h4>
                <p style={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
                    {desc}
                </p>
            </div>
        </motion.div>
    );
}

// --- Main UsecaseFlow Component ---
export const UsecaseFlow = () => {
    const [activeTab, setActiveTab] = useState<"agent" | "junior">("agent");

    return (
        <section id="usecase-flow" style={{
            position: "relative",
            width: "100%",
            backgroundColor: "#050505", // Matches page dark theme
            padding: "120px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "sans-serif",
            overflow: "hidden"
        }}>

            {/* Header / Toggle Section */}
            <div style={{ maxWidth: "1000px", width: "100%", zIndex: 10, textAlign: "center", marginBottom: "60px" }}>
                <h2 style={{
                    fontSize: "3.5rem",
                    fontWeight: 900,
                    color: "white",
                    letterSpacing: "-0.025em",
                    marginBottom: "2rem"
                }}>
                    Web3 For <span style={{ color: activeTab === "agent" ? "#ff4d4d" : "#00e5cc", transition: "color 0.4s ease" }}>Everyone</span>
                </h2>

                {/* Glassmorphism Toggle Switch */}
                <div style={{
                    display: "inline-flex",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "100px",
                    padding: "6px",
                    position: "relative",
                }}>
                    <button
                        onClick={() => setActiveTab("agent")}
                        style={{
                            padding: "12px 32px",
                            borderRadius: "100px",
                            border: "none",
                            background: activeTab === "agent" ? "rgba(255, 77, 77, 0.15)" : "transparent",
                            color: activeTab === "agent" ? "#ff4d4d" : "#9ca3af",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Bot size={18} />
                        Autonomous Agents
                    </button>
                    <button
                        onClick={() => setActiveTab("junior")}
                        style={{
                            padding: "12px 32px",
                            borderRadius: "100px",
                            border: "none",
                            background: activeTab === "junior" ? "rgba(0, 229, 204, 0.15)" : "transparent",
                            color: activeTab === "junior" ? "#00e5cc" : "#9ca3af",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Shield size={18} />
                        Junior Vaults
                    </button>
                </div>
            </div>

            {/* Dynamic Content Container */}
            <div style={{ maxWidth: "1200px", width: "100%", minHeight: "500px", position: "relative" }}>
                <AnimatePresence mode="wait">

                    {/* --- OPENCLAW AGENT FLOW --- */}
                    {activeTab === "agent" && (
                        <motion.div
                            key="agent-flow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "60px",
                                alignItems: "center"
                            }}
                        >
                            {/* Left: Graphic Visualization */}
                            <div style={{
                                position: "relative",
                                height: "400px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "radial-gradient(circle at center, rgba(255, 77, 77, 0.1) 0%, transparent 60%)"
                            }}>
                                <AnimatedOpenClaw />
                                {/* Data rings revolving around the agent */}
                                <motion.div
                                    style={{ position: "absolute", width: "350px", height: "350px", border: "1px dashed rgba(255,77,77,0.3)", borderRadius: "50%" }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    style={{ position: "absolute", width: "250px", height: "250px", border: "1px solid rgba(0,229,204,0.2)", borderRadius: "50%" }}
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                />
                            </div>

                            {/* Right: Flow Steps */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "60px",
                                alignItems: "center"
                            }}
                        >
                            {/* Left: Graphic Visualization */}
                            <div style={{
                                position: "relative",
                                height: "400px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "radial-gradient(circle at center, rgba(0, 229, 204, 0.1) 0%, transparent 60%)"
                            }}>
                                {/* Holographic Shield Animation */}
                                <motion.div
                                    animate={{ y: [-15, 15, -15], scale: [1, 1.05, 1] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Shield size={180} color="#00e5cc" strokeWidth={1} style={{ filter: "drop-shadow(0 0 30px rgba(0,229,204,0.5))" }} />
                                    <Sparkles size={40} color="#FACC15" style={{ position: "absolute", top: -10, right: -10 }} />
                                </motion.div>
                                {/* Defense rings revolving around the shield */}
                                <motion.div
                                    style={{ position: "absolute", width: "350px", height: "350px", border: "1px dashed rgba(0,229,204,0.3)", borderRadius: "50%" }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    style={{ position: "absolute", width: "250px", height: "250px", border: "1px solid rgba(250,204,21,0.2)", borderRadius: "50%" }}
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                />
                            </div>

                            {/* Right: Flow Steps */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <FlowStepCard
                                    step={1}
                                    title="Parental Vault Setup"
                                    desc="Parent deploys a smart PDA vault. They establish the PolicySet: a strict $20 daily limit, and a whitelist of approved dApps (e.g., specific games or DEXs)."
                                    icon={<Shield color="#00e5cc" />}
                                    delay={0.1}
                                    accentColor="#00e5cc"
                                />
                                <FlowStepCard
                                    step={2}
                                    title="Invisible Delegation"
                                    desc="The junior user is silently issued a time-bound Session Key. Their frontend interactions feel identical to Web2, without pop-ups or seed phrase risks."
                                    icon={<Zap color="#00e5cc" />}
                                    delay={0.3}
                                    accentColor="#00e5cc"
                                />
                                <FlowStepCard
                                    step={3}
                                    title="Sponsored Execution"
                                    desc="When trading or playing, a Relayer pushes the transaction. Gas is sponsored by the Parent's GasTank. The on-chain policy verifies limits mathematically."
                                    icon={<Activity color="#00e5cc" />}
                                    delay={0.5}
                                    accentColor="#00e5cc"
                                />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </section>
    );
};
