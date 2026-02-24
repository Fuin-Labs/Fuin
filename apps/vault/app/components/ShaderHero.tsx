"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import * as THREE from "three";

const GlowingSingularity = () => {
    const sphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (sphereRef.current) {
            // Base rotation
            sphereRef.current.rotation.x += 0.005;
            sphereRef.current.rotation.y += 0.005;

            // Interactive rotation based on mouse pointer
            const targetX = state.pointer.y * 1.5;
            const targetY = state.pointer.x * 1.5;

            sphereRef.current.rotation.x = THREE.MathUtils.lerp(sphereRef.current.rotation.x, targetX, 0.05);
            sphereRef.current.rotation.y = THREE.MathUtils.lerp(sphereRef.current.rotation.y, targetY, 0.05);

            // Subtle interactive scaling
            const targetScale = 1 + Math.abs(state.pointer.x * 0.2) + Math.abs(state.pointer.y * 0.2);
            sphereRef.current.scale.setScalar(THREE.MathUtils.lerp(sphereRef.current.scale.x, targetScale, 0.05));
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={sphereRef}>
                <sphereGeometry args={[1.5, 64, 64]} />
                <MeshDistortMaterial
                    color="#FACC15"
                    emissive="#d97706"
                    emissiveIntensity={0.6}
                    distort={0.5}
                    speed={3}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
};

export const ShaderHero = () => {
    return (
        <section style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            backgroundColor: "#050505",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif"
        }}>
            {/* Background WebGL Canvas */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <ambientLight intensity={0.2} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <Environment preset="city" />

                    <group position={[1.5, 0, 0]}>
                        <GlowingSingularity />
                    </group>

                    {/* Golden sparkles drifting in the background */}
                    <Sparkles count={200} scale={10} size={2} speed={0.4} opacity={0.5} color="#FACC15" />
                </Canvas>
            </div>

            {/* Left-Side Contrast Gradient Mask to Ensure Legibility */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "60vw",
                background: "linear-gradient(to right, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0) 100%)",
                zIndex: 5,
                pointerEvents: "none"
            }} />

            {/* Foreground Content */}
            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none" // Let mouse events pass through to canvas
            }}>
                {/* Left Text Segment */}
                <div style={{ textAlign: "left", flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Glowing Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            backgroundColor: "rgba(255, 255, 255, 0.03)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "100px",
                            width: "fit-content",
                            marginBottom: "16px"
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#22c55e",
                                boxShadow: "0 0 10px #22c55e"
                            }}
                        />
                        <span style={{ color: "#d1d5db", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                            Fuin Protocol Devnet Live
                        </span>
                    </motion.div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <motion.h1
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{
                                fontSize: "7rem",
                                fontWeight: 900,
                                letterSpacing: "-0.05em",
                                color: "#ffffff",
                                margin: 0,
                                lineHeight: 1,
                                textShadow: "0 0 40px rgba(250, 204, 21, 0.4), 0 0 20px rgba(255,255,255,0.2)"
                            }}
                        >
                            FUIN
                        </motion.h1>

                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            style={{
                                fontSize: "2rem",
                                fontWeight: 500,
                                color: "#FACC15",
                                margin: 0,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                textShadow: "0 0 20px rgba(250, 204, 21, 0.6)"
                            }}
                        >
                            IAM FOR BLOCKCHAIN
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        style={{
                            fontSize: "1.25rem",
                            color: "#e5e7eb",
                            maxWidth: "480px",
                            margin: 0,
                            lineHeight: 1.6,
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                        }}
                    >
                        A Programmable Authorization Layer on Solana. Deploy restrictive, policy-gated wallets for Autonomous Agents and Junior users.
                    </motion.p>

                    {/* Interactive CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        style={{ display: "flex", gap: "16px", marginTop: "16px" }}
                    >
                        <Link href="/dashboard" style={{ textDecoration: "none" }}>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(250, 204, 21, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: "16px 32px",
                                    backgroundColor: "#FACC15",
                                    color: "#050505",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "1.1rem",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    boxShadow: "0 0 15px rgba(250, 204, 21, 0.2)",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Start Building
                            </motion.button>
                        </Link>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.4)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: "16px 32px",
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                color: "white",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "12px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                backdropFilter: "blur(10px)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            Read Docs
                        </motion.button>
                    </motion.div>
                </div>

                {/* Right Terminal Overlay */}
                <motion.div
                    initial={{ opacity: 0, y: 50, rotateX: 10, rotateY: -10 }}
                    animate={{
                        opacity: 1,
                        y: [0, -15, 0], // Levitation effect
                        rotateX: 0,
                        rotateY: 0
                    }}
                    transition={{
                        opacity: { duration: 1, delay: 1 },
                        rotateX: { duration: 1, delay: 1 },
                        rotateY: { duration: 1, delay: 1 },
                        y: { duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                    }}
                    style={{
                        flex: 0.8,
                        backgroundColor: "rgba(5, 5, 5, 0.4)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(250, 204, 21, 0.2)",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(250, 204, 21, 0.05)",
                        fontFamily: "monospace",
                        color: "#a3a3a3",
                        textAlign: "left",
                        fontSize: "0.9rem",
                        lineHeight: 1.8
                    }}
                >
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                    </div>
                    <div><span style={{ color: "#FACC15" }}>{"❯ "}</span>Initialize Secure Container... [OK]</div>
                    <div><span style={{ color: "#FACC15" }}>{"❯ "}</span>Deriving Session Keys...</div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 1.5 }}
                    >
                        <span style={{ color: "#22c55e" }}>[SUCCESS]</span> Key Pair Generated
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 2.0 }}
                        style={{ marginTop: "12px", color: "white", wordBreak: "break-all", fontSize: "0.8rem" }}
                    >
                        PubKey: 0x7a3F9B...21e4<br />
                        Expiry: +3600s
                    </motion.div>
                </motion.div>
            </div>

            {/* Soft gradient blending into the scrollytelling section below */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "200px",
                background: "linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,1) 100%)",
                zIndex: 5
            }} />
        </section>
    );
};
