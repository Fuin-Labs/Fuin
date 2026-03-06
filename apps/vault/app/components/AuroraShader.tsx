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

void main() {
  // Aspect-corrected centered UV
  vec2 uv = v_uv - 0.5;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float t = u_time * 0.06;

  // Orb geometry
  vec2 orbCenter = vec2(0.0, -0.05);
  vec2 p = uv - orbCenter;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  float orbRadius = 0.32;
  float surfaceDist = max(dist - orbRadius, 0.0);

  // === Domain warping (Inigo Quilez technique) ===
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

  // === Geometric masks ===

  // Glow radiating from orb surface
  float glow = exp(-surfaceDist * 3.0);

  // Pool of light below the orb
  float belowPool = exp(-pow(p.y + 0.38, 2.0) * 6.0) * exp(-p.x * p.x * 3.0);

  // Upward tendril bias
  float upward = smoothstep(-0.1, 0.5, p.y) * exp(-abs(p.x) * 1.5);

  // Prominent arc toward upper-right (~63 degrees)
  float arcTarget = 1.1;
  float arc = exp(-pow(angle - arcTarget, 2.0) * 0.8);
  arc *= smoothstep(0.28, 0.45, dist) * exp(-surfaceDist * 2.0);

  // Combined shape
  float shape = glow * 0.6 + belowPool * 0.4 + upward * 0.3 + arc * 0.5;

  // Modulate with domain-warped noise for organic flow
  float noise = warp * 0.5 + 0.5;
  float intensity = shape * (0.4 + noise * 0.6);

  // Thin detail wisps
  float wisps = snoise(uv * 10.0 + r * 3.0 + vec2(t * 0.8, t * 0.6));
  wisps = max(wisps, 0.0);
  intensity += wisps * glow * 0.12;

  // Dark orb cutout
  float orb = smoothstep(orbRadius - 0.015, orbRadius + 0.01, dist);
  intensity *= orb;

  // Bright rim at orb edge
  float rim = exp(-pow(dist - orbRadius, 2.0) * 400.0);
  intensity += rim * 0.5;

  // === Color ===
  vec3 teal = vec3(0.0, 0.75, 0.68);
  vec3 cyan = vec3(0.1, 0.85, 0.9);
  vec3 color = mix(teal, cyan, warp * 0.3 + 0.15);

  vec3 finalColor = color * intensity * 0.22;

  // Vignette — wide enough to let aurora span the section
  float vig = 1.0 - smoothstep(0.35, 0.85, length(v_uv - 0.5));
  finalColor *= vig;

  // Slight gamma lift
  finalColor = pow(finalColor, vec3(0.92));

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function AuroraShader() {
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
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    function render() {
      const t = (performance.now() - start) * 0.001;
      gl!.uniform1f(uTime, t);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
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
