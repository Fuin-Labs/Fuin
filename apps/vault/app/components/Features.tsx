"use client";

import { motion } from "framer-motion";
import { Database, Cpu, Send } from "lucide-react";

export const Features = () => {
    return (
        <section id="features" style={{
            position: "relative",
            width: "100%",
            backgroundColor: "#050505",
            padding: "120px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "sans-serif",
            overflow: "hidden"
        }}>
            {/* Ambient Background Glow */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "80vw",
                    height: "80vw",
                    maxWidth: "800px",
                    maxHeight: "800px",
                    background: "radial-gradient(circle, rgba(250, 204, 21, 0.05) 0%, rgba(5,5,5,0) 70%)",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 0
                }}
            />

            <div style={{ maxWidth: "1000px", width: "100%", zIndex: 10, position: "relative" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: "center", marginBottom: "80px" }}
                >
                    <h2 style={{
                        fontSize: "3.5rem",
                        fontWeight: 900,
                        color: "white",
                        letterSpacing: "-0.025em",
                        marginBottom: "1rem"
                    }}>
                        The Protocol for <span style={{ color: "#FACC15", textShadow: "0 0 15px rgba(250, 204, 21, 0.4)" }}>Autonomous Agents</span>
                    </h2>
                    <p style={{
                        color: "#9ca3af",
                        fontSize: "1.25rem",
                        maxWidth: "600px",
                        margin: "0 auto",
                        lineHeight: 1.6
                    }}>
                        Fuin provides an advanced capability-based execution router, allowing guardians to deploy heavily sandboxed, policy-restricted wallets on Solana.
                    </p>
                </motion.div>

                {/* ASYMMETRIC BENTO GRID */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "auto auto",
                    gap: "24px",
                    width: "100%"
                }}>

                    {/* Feature 1: Massive Spanning Hero Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{
                            y: -10,
                            boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(250, 204, 21, 0.4)",
                            backgroundColor: "rgba(255, 255, 255, 0.04)"
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        style={{
                            gridColumn: "1 / -1", // Span full width
                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "32px",
                            padding: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "40px",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Oversized background icon clipping out */}
                        <div style={{ position: "absolute", right: "-10%", top: "-20%", opacity: 0.03, pointerEvents: "none" }}>
                            <Database size={400} color="#FACC15" />
                        </div>

                        <div style={{ flex: 1, zIndex: 1 }}>
                            <div style={{
                                width: "64px", height: "64px", borderRadius: "16px",
                                backgroundColor: "rgba(250, 204, 21, 0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: "1px solid rgba(250, 204, 21, 0.2)",
                                marginBottom: "24px"
                            }}>
                                <Database color="#FACC15" size={32} />
                            </div>
                            <h3 style={{ color: "white", fontSize: "2rem", fontWeight: 800, margin: "0 0 16px 0" }}>On-Chain Policy Engine</h3>
                            <p style={{ color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1.7, margin: 0, maxWidth: "550px" }}>
                                A highly modular, composable PolicySet framework. Guardians can independently stack and version rules for spending caps, program allow-lists, epoch-based time locks, and risk boundaries without rewriting the core vault.
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 2: Half Width Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{
                            y: -10,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(250, 204, 21, 0.3)",
                            backgroundColor: "rgba(255, 255, 255, 0.04)"
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "32px",
                            padding: "40px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Oversized background icon clipping out */}
                        <div style={{ position: "absolute", right: "-10%", bottom: "-10%", opacity: 0.03, pointerEvents: "none" }}>
                            <Cpu size={250} color="#FACC15" />
                        </div>

                        <div style={{
                            width: "56px", height: "56px", borderRadius: "14px",
                            backgroundColor: "rgba(250, 204, 21, 0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(250, 204, 21, 0.2)"
                        }}>
                            <Cpu color="#FACC15" size={28} />
                        </div>
                        <h3 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, margin: 0, zIndex: 1 }}>Strict AI Sandboxing</h3>
                        <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.6, margin: 0, zIndex: 1 }}>
                            Agents cannot compose arbitrary transactions. They are locked to a Capability Routing model, executing strictly pre-audited intents mapped directly to on-chain program schemas.
                        </p>
                    </motion.div>

                    {/* Feature 3: Half Width Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{
                            y: -10,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(250, 204, 21, 0.3)",
                            backgroundColor: "rgba(255, 255, 255, 0.04)"
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "32px",
                            padding: "40px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Oversized background icon clipping out */}
                        <div style={{ position: "absolute", left: "-10%", bottom: "-10%", opacity: 0.03, pointerEvents: "none" }}>
                            <Send size={250} color="#FACC15" />
                        </div>

                        <div style={{
                            width: "56px", height: "56px", borderRadius: "14px",
                            backgroundColor: "rgba(250, 204, 21, 0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(250, 204, 21, 0.2)"
                        }}>
                            <Send color="#FACC15" size={28} />
                        </div>
                        <h3 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, margin: 0, zIndex: 1 }}>Gasless Meta-Transactions</h3>
                        <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.6, margin: 0, zIndex: 1 }}>
                            An ERC-4337 style courier model. Relayers execute intents via Ed25519 syscall verification, pulling from a Guardian-funded GasTank. Agents never need SOL.
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
