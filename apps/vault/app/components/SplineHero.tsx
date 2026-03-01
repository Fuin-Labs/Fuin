"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SCENE_URL =
  "https://prod.spline.design/h-MHyoN6QXE9upgO/scene.splinecode";

function shouldLoadSpline(): boolean {
  if (typeof window === "undefined") return false;
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency <= 2;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  return !isMobile && !isLowEnd && !!gl;
}

export default function SplineHero() {
  const [loaded, setLoaded] = useState(false);
  const [canLoad, setCanLoad] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setCanLoad(shouldLoadSpline());
  }, []);

  useEffect(() => {
    if (!canLoad) return;
    timeoutRef.current = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 12000);
    return () => clearTimeout(timeoutRef.current);
  }, [canLoad, loaded]);

  function onLoad() {
    clearTimeout(timeoutRef.current);
    setLoaded(true);
  }

  if (!canLoad || failed) return null;

  return (
    <div
      className="spline-hero-wrapper"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {/* Gradient overlay so left-side text stays readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Spline
        scene={SCENE_URL}
        onLoad={onLoad}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1.8)",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
