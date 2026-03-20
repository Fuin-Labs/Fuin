"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

// --- Simplex 2D noise (Ashima Arts) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- FBM (fractal Brownian motion), 4 octaves ---
float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    f += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return f;
}

// Ray-sphere intersection: returns (tNear, tFar), or (-1,-1) on miss
vec2 raySphere(vec3 ro, vec3 rd, vec3 center, float radius) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float disc = b * b - c;
  if (disc < 0.0) return vec2(-1.0);
  float sq = sqrt(disc);
  return vec2(-b - sq, -b + sq);
}

void main() {
  // Normalized coords centered at origin, aspect-corrected
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.06;

  // Adapt for portrait (mobile) vs landscape
  bool portrait = aspect < 0.85;

  // Camera
  vec3 ro = vec3(0.0, 0.0, 3.5);
  vec3 rd = normalize(vec3(uv, -1.5));

  // Sphere
  vec3 sphCenter = portrait ? vec3(0.0, 0.05, 0.0) : vec3(0.0, -0.05, 0.0);
  float sphRadius = portrait ? 0.55 : 0.75;

  vec2 hit = raySphere(ro, rd, sphCenter, sphRadius);

  // Colors
  vec3 teal = vec3(0.0, 0.75, 0.68);
  vec3 cyan = vec3(0.1, 0.85, 0.9);

  // === Aurora glow (computed for all pixels) ===
  // Closest approach of ray to sphere surface (screen-space proxy)
  vec3 oc = ro - sphCenter;
  float tClosest = -dot(oc, rd);
  vec3 closestPt = ro + rd * max(tClosest, 0.0);
  float closestDist = length(closestPt - sphCenter);
  float surfaceDist = max(closestDist - sphRadius, 0.0);

  // 2D projection for directional aurora masks
  vec2 p2d = uv - sphCenter.xy * 0.3;
  float dist2d = length(p2d);
  float angle = atan(p2d.y, p2d.x);
  float srad2d = sphRadius * 0.5;
  float sdist2d = max(dist2d - srad2d, 0.0);

  // Domain-warped noise
  vec2 seed = uv * 2.5;
  vec2 q = vec2(
    fbm(seed + vec2(0.0, 0.0) + t * 0.7),
    fbm(seed + vec2(5.2, 1.3) + t * 0.5)
  );
  vec2 r = vec2(
    fbm(seed + 3.0 * q + vec2(1.7, 9.2) + t * 0.3),
    fbm(seed + 3.0 * q + vec2(8.3, 2.8) + t * 0.4)
  );
  float warp = fbm(seed + 3.0 * r);

  // Glow radiating from sphere surface
  float glow = exp(-surfaceDist * 4.0);

  // Pool of light below the sphere
  float belowPool = exp(-pow(p2d.y + 0.55, 2.0) * 8.0) * exp(-p2d.x * p2d.x * 4.0);

  // Upward tendril bias
  float upward = smoothstep(-0.1, 0.5, p2d.y) * exp(-abs(p2d.x) * 2.0);

  // Prominent arc toward upper-right
  float arcTarget = 1.1;
  float arc = exp(-pow(angle - arcTarget, 2.0) * 0.8);
  arc *= smoothstep(srad2d * 0.8, srad2d * 1.4, dist2d) * exp(-sdist2d * 3.0);

  // Combined aurora shape
  float shape = glow * 0.6 + belowPool * 0.4 + upward * 0.3 + arc * 0.5;
  float noise = warp * 0.5 + 0.5;
  float auroraIntensity = shape * (0.4 + noise * 0.6);

  // Thin detail wisps
  float wisps = snoise(uv * 10.0 + r * 3.0 + vec2(t * 0.8, t * 0.6));
  wisps = max(wisps, 0.0);
  auroraIntensity += wisps * glow * 0.12;

  vec3 auroraColor = mix(teal, cyan, warp * 0.3 + 0.15) * auroraIntensity * 0.25;

  vec3 finalColor;

  if (hit.x > 0.0) {
    // === Sphere surface ===
    vec3 hitPt = ro + rd * hit.x;
    vec3 N = normalize(hitPt - sphCenter);

    // Fresnel (glass-like rim glow)
    float NdotV = max(dot(-rd, N), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.5);

    // Subtle surface noise (internal swirl)
    float surfNoise = fbm(N.xy * 3.0 + t * 0.15) * 0.03;

    // Dark glass interior
    vec3 interior = vec3(0.005) + teal * surfNoise;

    // Fresnel rim light
    vec3 rimColor = mix(teal, cyan, fresnel) * fresnel * 0.7;

    // Specular highlight from upper-right light source
    vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
    vec3 refl = reflect(-lightDir, N);
    float spec = pow(max(dot(refl, -rd), 0.0), 40.0);

    // Aurora light bleeding onto sphere surface
    vec3 auroraBleed = auroraColor * fresnel * 0.4;

    finalColor = interior + rimColor + cyan * spec * 0.2 + auroraBleed;
  } else {
    // === Outside sphere — aurora only ===
    finalColor = auroraColor;

    // Extra bright edge glow right at sphere silhouette
    float edgeGlow = exp(-surfaceDist * surfaceDist * 300.0);
    finalColor += mix(teal, cyan, 0.5) * edgeGlow * 0.35;
  }

  // Vignette
  float vigStart = portrait ? 0.25 : 0.35;
  float vigEnd = portrait ? 0.95 : 0.85;
  float vig = 1.0 - smoothstep(vigStart, vigEnd, length(v_uv - 0.5));
  finalColor *= vig;

  // Gamma lift
  finalColor = pow(finalColor, vec3(0.92));

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function AuroraShader({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    function resize() {
      const isMobile = canvas!.clientWidth < 768;
      const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let firstFrame = true;
    function render() {
      const t = (performance.now() - start) * 0.001;
      gl!.uniform1f(uTime, t);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      if (firstFrame) {
        firstFrame = false;
        onReady?.();
      }
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
