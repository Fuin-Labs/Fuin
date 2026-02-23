"use client";

import { motion } from "framer-motion";
import { Twitter, Github, DiscIcon as Discord, ArrowUpRight } from "lucide-react";

export const Footer = () => {
    return (
        <footer style={{
            position: "relative",
            width: "100%",
            backgroundColor: "#050505",
            padding: "160px 40px 60px 40px", // Massive top padding for visual breathing room
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "sans-serif",
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.02)"
        }}>

            {/* The "Banger" Intense Bottom-Radial Glow */}
            <div style={{
                position: "absolute",
                bottom: "-30%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120vw",
                height: "60vw",
                background: "radial-gradient(ellipse at center, rgba(250, 204, 21, 0.08) 0%, rgba(5,5,5,0) 60%)",
                pointerEvents: "none",
                zIndex: 0
            }} />

            {/* MASSIVE Subliminal Background Typography (Editorial/Brutalist style) */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "25vw", // Dynamically massive
                fontWeight: 900,
                letterSpacing: "-0.05em",
                color: "rgba(255,255,255,0.015)",
                pointerEvents: "none",
                zIndex: 1,
                userSelect: "none",
                whiteSpace: "nowrap"
            }}>
                FUIN
            </div>

            {/* Main Content Container */}
            <div style={{
                maxWidth: "1200px",
                width: "100%",
                position: "relative",
                zIndex: 10,
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                gap: "60px",
                marginBottom: "120px"
            }}>

                {/* Column 1: Branding & Mission */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "32px", height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "#FACC15",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 20px rgba(250, 204, 21, 0.4)"
                        }}>
                            <span style={{ color: "#050505", fontWeight: 900, fontSize: "16px" }}>F</span>
                        </div>
                        <span style={{ color: "white", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em" }}>Fuin</span>
                    </div>

                    <p style={{
                        color: "#9ca3af",
                        fontSize: "1.1rem",
                        lineHeight: 1.6,
                        maxWidth: "350px",
                        margin: 0
                    }}>
                        IAM for Blockchain. Programmable authorization, restrictive wallets, and capability-based execution for Autonomous Agents and Junior Users.
                    </p>
                </div>

                {/* Column 2: Ecosystem Links (Editorial List) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "0.05em" }}>ECOSYSTEM</h4>
                    {["Documentation"].map((link) => (
                        <motion.a
                            key={link}
                            href="#"
                            whileHover={{ x: 5, color: "#ffffff" }}
                            style={{
                                color: "#6b7280",
                                fontSize: "1rem",
                                textDecoration: "none",
                                transition: "color 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            {link}
                        </motion.a>
                    ))}
                </div>

                {/* Column 3: Connect & Socials (Glassmorphism & High Interactivity) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "0.05em" }}>CONNECT</h4>
                    <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                        Join the resistance. Build the next generation of sandboxed agents with us.
                    </p>

                    <div style={{ display: "flex", gap: "16px" }}>
                        {/* Twitter / X */}
                        <motion.a
                            href="#"
                            whileHover={{
                                y: -5,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            style={{
                                width: "48px", height: "48px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)"
                            }}
                        >
                            <Twitter size={20} />
                        </motion.a>

                        {/* Discord (Blurple Hover) */}
                        <motion.a
                            href="#"
                            whileHover={{
                                y: -5,
                                backgroundColor: "rgba(88, 101, 242, 0.1)",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(88, 101, 242, 0.5), 0 0 20px rgba(88, 101, 242, 0.3)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            style={{
                                width: "48px", height: "48px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)"
                            }}
                        >
                            <Discord size={20} />
                        </motion.a>

                        {/* GitHub (White/Silver Hover) */}
                        <motion.a
                            href="#"
                            whileHover={{
                                y: -5,
                                backgroundColor: "rgba(255,255,255,0.1)",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.1)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            style={{
                                width: "48px", height: "48px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)"
                            }}
                        >
                            <Github size={20} />
                        </motion.a>
                    </div>
                </div>

            </div>

            {/* Bottom Strip: Copyright & Legal */}
            <div style={{
                width: "100%",
                maxWidth: "1200px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "32px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                zIndex: 10,
                position: "relative"
            }}>
                <span style={{ color: "#4b5563", fontSize: "0.9rem" }}>
                    © {new Date().getFullYear()} Fuin Labs. All rights reserved. Built on Solana.
                </span>

                <div style={{ display: "flex", gap: "24px" }}>
                    {["Terms of Service", "Privacy Policy", "Cookie Settings"].map((link) => (
                        <motion.a
                            key={link}
                            href="#"
                            whileHover={{ color: "#9ca3af" }}
                            style={{
                                color: "#4b5563",
                                fontSize: "0.9rem",
                                textDecoration: "none",
                                transition: "color 0.2s ease"
                            }}
                        >
                            {link}
                        </motion.a>
                    ))}
                </div>
            </div>

        </footer>
    );
};
