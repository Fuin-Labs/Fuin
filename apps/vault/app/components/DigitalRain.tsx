"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * DigitalRain — Fuin hero shader.
 * Columns of on-chain alphabet (hex + base58 + Greek/math) fall and settle into a
 * water-surface ledger, leaving ripples. The lead character is ivory hot-spot;
 * near-lead is lime "live line"; trail fades to deep lime.
 *
 * Lazy-mounts on first visibility, pauses when off-screen, full static fallback
 * under `prefers-reduced-motion: reduce`. Adapted from radiant-shaders.com.
 */

type Palette = "fuin" | "amber";
type Alphabet = "onchain" | "matrix";

interface DigitalRainProps {
  density?: number;     // 0..1, default 0.42
  fallSpeed?: number;   // 0..3, default 0.65
  palette?: Palette;    // default "fuin"
  alphabet?: Alphabet;  // default "onchain"
  className?: string;
}

const PALETTES = {
  fuin: {
    bg: "#0a0907",
    lead:  { r: 255, g: 245, b: 232 },
    near:  { r: 217, g: 240, b: 120 },
    trail: { r: 155, g: 199, b: 58  },
    glow:    "rgba(193, 232, 89, 0.55)",
    surfStroke: "rgba(193, 232, 89, 0.22)",
    surfGlow:   "rgba(193, 232, 89, 0.06)",
    ripple:  "rgba(193, 232, 89, ",
    zen:     "rgba(193, 232, 89, ",
    particle:"rgba(193, 232, 89, ",
    reflect: "rgba(155, 199, 58, ",
    vignette:"rgba(10, 9, 7, 0.5)",
  },
  amber: {
    bg: "#0a0a0a",
    lead:  { r: 255, g: 245, b: 220 },
    near:  { r: 240, g: 200, b: 140 },
    trail: { r: 200, g: 149, b: 108 },
    glow:    "rgba(255, 220, 160, 0.6)",
    surfStroke: "rgba(200, 170, 130, 0.25)",
    surfGlow:   "rgba(200, 149, 108, 0.06)",
    ripple:  "rgba(200, 170, 130, ",
    zen:     "rgba(200, 170, 130, ",
    particle:"rgba(200, 149, 108, ",
    reflect: "rgba(200, 149, 108, ",
    vignette:"rgba(10, 10, 10, 0.45)",
  },
} as const;

const ALPHABETS: Record<Alphabet, string> = {
  // hex + Solana base58 (no 0/O/I/l) + Greek/math — the on-chain alphabet
  onchain: "0123456789abcdefABCDEFGHJKLMNPQRSTUVWXYZghijkmnopqrstuvwxyzΣΠ√∞Δαβγθφψω∂≈×÷",
  matrix:  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789",
};

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: { char: string; cycleTimer: number; cycleRate: number }[];
  active: boolean;
  restartDelay: number;
  opacity: number;
  hitWater: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  life: number;
  decay: number;
}

export function DigitalRain({
  density = 0.42,
  fallSpeed = 0.65,
  palette = "fuin",
  alphabet = "onchain",
  className,
}: DigitalRainProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Paused-ref lets the rAF loop stay alive while we gate the render work.
  // Toggled by the visibility/intersection effect; saves teardown + reallocation
  // on every scroll-in/out, so columns resume where they left off.
  const pausedRef = useRef<boolean>(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Mirror shouldAnimate into the ref synchronously so the rAF loop sees the
  // current state without re-running its setup effect.
  useLayoutEffect(() => {
    pausedRef.current = !shouldAnimate;
  }, [shouldAnimate]);

  // Detect prefers-reduced-motion (client-only, after mount)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent): void => setPrefersReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lazy-mount via IntersectionObserver — only animate when in view.
  // Combined with Page Visibility so we also pause when the tab is backgrounded
  // (saves battery on long-lived tabs; browsers throttle but don't stop rAF).
  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReduced) return;
    let intersecting = false;
    let visible = document.visibilityState === "visible";
    const update = (): void => setShouldAnimate(intersecting && visible);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) intersecting = e.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    const onVisibility = (): void => {
      visible = document.visibilityState === "visible";
      update();
    };
    io.observe(containerRef.current);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReduced]);

  // The animation loop — set up once per (palette, alphabet, density, fallSpeed).
  // Visibility/intersection gates the per-frame work via `pausedRef`, NOT this
  // effect's deps — so scroll-in/out doesn't tear down + rebuild state.
  useEffect(() => {
    if (prefersReduced) return; // static fallback path; no canvas work
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const P = PALETTES[palette];
    const A = ALPHABETS[alphabet];
    const FONT_SIZE = 15;
    const WAVE_RESOLUTION = 4;
    const MAX_RIPPLES = 30;

    const randomChar = (): string => A[Math.floor(Math.random() * A.length)] ?? "0";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let waterSurface = 0;
    let columns: Column[] = [];
    let ripples: Ripple[] = [];
    let wavePoints: { y: number; vy: number }[] = [];

    const createColumn = (index: number, scatter: boolean): Column => {
      const trailLen = 12 + Math.floor(Math.random() * 20);
      const maxChars = trailLen + 5;
      const chars = [];
      for (let j = 0; j < maxChars; j++) {
        chars.push({
          char: randomChar(),
          cycleTimer: Math.random() * 3,
          cycleRate: 0.5 + Math.random() * 2,
        });
      }
      let startY: number;
      if (scatter) {
        if (Math.random() < density) {
          startY = Math.random() * (waterSurface + trailLen * FONT_SIZE) - trailLen * FONT_SIZE * 0.3;
        } else {
          startY = -trailLen * FONT_SIZE - Math.random() * height * 0.5;
        }
      } else {
        startY = -trailLen * FONT_SIZE * Math.random() * 0.3;
      }
      return {
        x: index * FONT_SIZE,
        y: startY,
        speed: 1.0 + Math.random() * 2.0,
        length: trailLen,
        chars,
        active: scatter ? Math.random() < density + 0.15 : Math.random() < density,
        restartDelay: 0,
        opacity: 0.6 + Math.random() * 0.4,
        hitWater: false,
      };
    };

    const initColumns = (): void => {
      waterSurface = height * 0.78;
      const colCount = Math.floor(width / FONT_SIZE);
      const next: Column[] = [];
      for (let i = 0; i < colCount; i++) {
        const existing = columns[i];
        if (existing) {
          existing.x = i * FONT_SIZE;
          next.push(existing);
        } else {
          next.push(createColumn(i, true));
        }
      }
      columns = next;
      const waveCount = Math.ceil(width / WAVE_RESOLUTION) + 1;
      wavePoints = [];
      for (let w = 0; w < waveCount; w++) wavePoints.push({ y: 0, vy: 0 });
    };

    const resize = (): void => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initColumns();
    };

    const spawnRipple = (x: number, y: number): void => {
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({
        x, y, radius: 0,
        maxRadius: 22 + Math.random() * 40,
        speed: 18 + Math.random() * 24,
        life: 1.0,
        decay: 0.3 + Math.random() * 0.2,
      });
    };

    const disturbWave = (x: number, force: number): void => {
      const idx = Math.floor(x / WAVE_RESOLUTION);
      const spread = 3;
      for (let i = -spread; i <= spread; i++) {
        const wi = idx + i;
        if (wi >= 0 && wi < wavePoints.length) {
          const influence = 1 - Math.abs(i) / (spread + 1);
          wavePoints[wi]!.vy += force * influence;
        }
      }
    };

    const updateColumns = (dt: number): void => {
      for (const col of columns) {
        if (!col.active) {
          col.restartDelay -= dt;
          if (col.restartDelay <= 0) {
            if (Math.random() < density) {
              col.active = true;
              col.y = -col.length * FONT_SIZE * Math.random() * 0.3;
              col.speed = 1.0 + Math.random() * 2.0;
              col.length = 12 + Math.floor(Math.random() * 20);
              col.opacity = 0.6 + Math.random() * 0.4;
              col.hitWater = false;
              for (const c of col.chars) c.char = randomChar();
            } else {
              col.restartDelay = 0.4 + Math.random() * 2.0;
            }
          }
          continue;
        }
        const prevY = col.y;
        col.y += col.speed * fallSpeed * dt * 60;
        for (const c of col.chars) {
          c.cycleTimer -= dt;
          if (c.cycleTimer <= 0) {
            c.char = randomChar();
            c.cycleTimer = c.cycleRate;
          }
        }
        if (!col.hitWater && col.y >= waterSurface && prevY < waterSurface) {
          col.hitWater = true;
          spawnRipple(col.x + FONT_SIZE * 0.5, waterSurface);
          disturbWave(col.x + FONT_SIZE * 0.5, -2 - Math.random() * 3);
        }
        const tailY = col.y - col.length * FONT_SIZE;
        if (tailY > waterSurface + 30) {
          col.active = false;
          col.restartDelay = 0.3 + Math.random() * 2.5;
        }
      }
    };

    const drawColumns = (): void => {
      ctx.font = `${FONT_SIZE}px "SF Mono", "Fira Code", "Cascadia Code", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const col of columns) {
        if (!col.active) continue;
        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * FONT_SIZE;
          if (charY > waterSurface) continue;
          if (charY < -FONT_SIZE) continue;
          const charIndex = j % col.chars.length;
          const trailFraction = j / col.length;
          let brightness: number;
          if (j === 0) brightness = 1.0;
          else if (j === 1) brightness = 0.9;
          else if (j < 4) brightness = 0.75 - (j - 2) * 0.08;
          else brightness = Math.max(0, 0.6 * (1 - trailFraction));

          const distToWater = waterSurface - charY;
          if (distToWater < FONT_SIZE * 3) {
            brightness *= Math.max(0, distToWater / (FONT_SIZE * 3));
          }
          brightness *= col.opacity;
          if (brightness < 0.02) continue;

          const c = j === 0 ? P.lead : j < 3 ? P.near : P.trail;
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${brightness})`;

          if (j === 0) {
            ctx.shadowColor = P.glow;
            ctx.shadowBlur = 8;
          }
          ctx.fillText(col.chars[charIndex]!.char, col.x + FONT_SIZE * 0.5, charY);
          if (j === 0) {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        }
      }
    };

    const drawReflections = (): void => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, waterSurface, width, height - waterSurface);
      ctx.clip();
      ctx.font = `${FONT_SIZE}px "SF Mono", "Fira Code", "Cascadia Code", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const col of columns) {
        if (!col.active) continue;
        for (let j = 0; j < Math.min(col.length, 8); j++) {
          const charY = col.y - j * FONT_SIZE;
          if (charY > waterSurface || charY < waterSurface - FONT_SIZE * 8) continue;
          const charIndex = j % col.chars.length;
          const reflectY = waterSurface + (waterSurface - charY);
          const depthBelow = reflectY - waterSurface;
          const reflectAlpha = Math.max(0, 0.12 * (1 - depthBelow / (height * 0.2)));
          const waveIdx = Math.floor(col.x / WAVE_RESOLUTION);
          const waveOffset = waveIdx >= 0 && waveIdx < wavePoints.length ? wavePoints[waveIdx]!.y * 2 : 0;
          if (reflectAlpha < 0.01) continue;
          ctx.fillStyle = `${P.reflect}${reflectAlpha})`;
          ctx.fillText(
            col.chars[charIndex]!.char,
            col.x + FONT_SIZE * 0.5 + Math.sin(depthBelow * 0.05) * 3,
            reflectY + waveOffset,
          );
        }
      }
      ctx.restore();
    };

    const updateRipples = (dt: number): void => {
      let i = ripples.length;
      while (i--) {
        const r = ripples[i]!;
        r.radius += r.speed * dt;
        r.life -= r.decay * dt;
        if (r.life <= 0 || r.radius > r.maxRadius) ripples.splice(i, 1);
      }
    };

    const drawRipples = (): void => {
      for (const r of ripples) {
        const alpha = r.life * 0.3;
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = r.radius - ring * 8;
          if (ringRadius <= 0) continue;
          const ringAlpha = alpha * (1 - ring * 0.3);
          ctx.beginPath();
          ctx.ellipse(r.x, r.y + ring * 2, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${P.ripple}${ringAlpha.toFixed(3)})`;
          ctx.lineWidth = 1 - ring * 0.2;
          ctx.stroke();
        }
      }
    };

    const updateWaves = (): void => {
      const damping = 0.97;
      const tension = 0.03;
      const spread = 0.25;
      for (const p of wavePoints) {
        p.vy += -tension * p.y;
        p.vy *= damping;
        p.y += p.vy;
      }
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < wavePoints.length; i++) {
          if (i > 0) wavePoints[i]!.vy += spread * (wavePoints[i - 1]!.y - wavePoints[i]!.y);
          if (i < wavePoints.length - 1) wavePoints[i]!.vy += spread * (wavePoints[i + 1]!.y - wavePoints[i]!.y);
        }
      }
    };

    const drawWaterSurface = (time: number): void => {
      const waterGrad = ctx.createLinearGradient(0, waterSurface, 0, height);
      waterGrad.addColorStop(0, "rgba(10, 9, 7, 0.55)");
      waterGrad.addColorStop(0.3, "rgba(8, 7, 6, 0.85)");
      waterGrad.addColorStop(1, "rgba(6, 5, 4, 0.95)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, waterSurface - 2, width, height - waterSurface + 2);

      ctx.beginPath();
      for (let x = 0; x <= width; x += WAVE_RESOLUTION) {
        const idx = Math.floor(x / WAVE_RESOLUTION);
        const waveY = idx < wavePoints.length ? wavePoints[idx]!.y : 0;
        const ambient =
          Math.sin(x * 0.01 + time * 0.8) * 1.5 +
          Math.sin(x * 0.023 + time * 0.5) * 1.0 +
          Math.sin(x * 0.007 + time * 0.3) * 2.0;
        const py = waterSurface + waveY + ambient;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.strokeStyle = P.surfStroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const surfGlow = ctx.createLinearGradient(0, waterSurface - 10, 0, waterSurface + 20);
      surfGlow.addColorStop(0, `${P.ripple}0)`);
      surfGlow.addColorStop(0.4, P.surfGlow);
      surfGlow.addColorStop(0.6, P.surfGlow);
      surfGlow.addColorStop(1, `${P.ripple}0)`);
      ctx.fillStyle = surfGlow;
      ctx.fillRect(0, waterSurface - 10, width, 30);
    };

    const drawZenRipples = (time: number): void => {
      const zenPoints = [
        { x: width * 0.3, y: waterSurface + (height - waterSurface) * 0.4 },
        { x: width * 0.7, y: waterSurface + (height - waterSurface) * 0.5 },
        { x: width * 0.5, y: waterSurface + (height - waterSurface) * 0.7 },
      ];
      for (let z = 0; z < zenPoints.length; z++) {
        const zp = zenPoints[z]!;
        for (let ring = 0; ring < 4; ring++) {
          const phase = time * 0.4 + ring * 1.5 + z * 2.0;
          const radius = 20 + (phase % 6) * 15;
          const alpha = 0.06 * Math.max(0, 1 - (phase % 6) / 6);
          if (alpha < 0.005) continue;
          ctx.beginPath();
          ctx.ellipse(zp.x, zp.y, radius, radius * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${P.zen}${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    };

    const drawVignette = (): void => {
      const cx = width / 2;
      const cy = height / 2;
      const maxDim = Math.max(width, height);
      const vignette = ctx.createRadialGradient(cx, cy, maxDim * 0.25, cx, cy, maxDim * 0.8);
      vignette.addColorStop(0, "rgba(10, 9, 7, 0)");
      vignette.addColorStop(1, P.vignette);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const drawWaterParticles = (time: number): void => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, waterSurface, width, height - waterSurface);
      ctx.clip();
      for (let i = 0; i < 24; i++) {
        const px = (Math.sin(i * 73.1 + time * 0.07) * 0.5 + 0.5) * width;
        const py = waterSurface + (Math.cos(i * 127.3 + time * 0.05) * 0.5 + 0.5) * (height - waterSurface);
        const alpha = 0.04 + 0.03 * Math.sin(time * 0.5 + i * 1.7);
        ctx.fillStyle = `${P.particle}${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const onClick = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      disturbWave(lx, -4 - Math.random() * 3);
      spawnRipple(lx, waterSurface);
      const colIdx = Math.floor(lx / FONT_SIZE);
      for (let di = -1; di <= 1; di++) {
        const ci = colIdx + di;
        if (ci >= 0 && ci < columns.length) {
          columns[ci]!.active = true;
          columns[ci]!.y = ly;
          columns[ci]!.speed = 2.2 + Math.random() * 1.8;
          columns[ci]!.opacity = 0.8 + Math.random() * 0.2;
          columns[ci]!.hitWater = false;
        }
      }
    };

    let rafId = 0;
    let lastTime = 0;
    const render = (timestamp: number): void => {
      // Gate: if paused (off-screen or tab hidden), keep the loop alive but
      // skip all draw/update work and reset the dt baseline so we don't jump
      // forward when resuming.
      if (pausedRef.current) {
        lastTime = 0;
        rafId = requestAnimationFrame(render);
        return;
      }
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      const time = timestamp / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = P.bg;
      ctx.fillRect(0, 0, width, height);

      updateColumns(dt);
      updateRipples(dt);
      updateWaves();

      drawColumns();
      drawWaterSurface(time);
      drawZenRipples(time);
      drawReflections();
      drawRipples();
      drawWaterParticles(time);
      drawVignette();

      rafId = requestAnimationFrame(render);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();
    canvas.addEventListener("click", onClick);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener("click", onClick);
    };
  }, [prefersReduced, palette, alphabet, density, fallSpeed]);

  // Static fallback: ASCII grid evoking the rain at rest, no animation.
  // Shows under prefers-reduced-motion or before lazy-mount.
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: PALETTES[palette].bg,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {prefersReduced ? (
        <StaticFallback palette={palette} />
      ) : (
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />
      )}
    </div>
  );
}

function StaticFallback({ palette }: { palette: Palette }): React.JSX.Element {
  const P = PALETTES[palette];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, ${P.bg} 0%, ${P.bg} 78%, rgba(6,5,4,0.95) 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "78%",
          height: 1,
          background: P.surfStroke,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(193, 232, 89, 0.10) 1px, transparent 1px)`,
          backgroundSize: "12px 16px",
          backgroundPosition: "0 0",
          opacity: 0.5,
          maskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 60%, transparent 78%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 60%, transparent 78%)",
        }}
      />
    </div>
  );
}
