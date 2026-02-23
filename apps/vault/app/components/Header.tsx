"use client";

import { motion } from "framer-motion";
import { Key } from "lucide-react";

export const Header = () => {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                zIndex: 100,
                backgroundColor: "rgba(5, 5, 5, 0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                fontFamily: "sans-serif"
            }}
        >
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
                <span style={{
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.05em"
                }}>
                    Fuin
                </span>
            </div>

            <nav style={{ display: "flex", gap: "32px" }}>
                <a href="#features" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}>Features</a>
                <a href="#security" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}>Security</a>
                <a href="#docs" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}>Documentation</a>
            </nav>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    backgroundColor: "#FACC15",
                    color: "#050505",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(250, 204, 21, 0.3)"
                }}
            >
                Launch App
            </motion.button>
        </motion.header>
    );
};
