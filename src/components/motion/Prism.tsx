"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { gsap } from "@/lib/gsap";

/**
 * Prisma em WebGL — raymarching de um SDF de pirâmide anisotrópica.
 *
 * Porte do componente Prism do React Bits (https://reactbits.dev/backgrounds/prism)
 * para o padrão do projeto. Divergências deliberadas do upstream:
 *
 * 1. Rampa da marca (`brandTint`/`palette`) — o shader original devolve um
 *    espectro arco-íris; aqui a luminância é remapeada para a paleta Dominyum.
 * 2. O render loop roda no `gsap.ticker` (o mesmo que já move o Lenis) em vez de
 *    abrir um `requestAnimationFrame` próprio — um loop só na página.
 * 3. DPR limitado (`maxDpr`) e `suspendWhenOffscreen` ligado por padrão: o
 *    shader faz 100 passos de raymarch por pixel e não pode seguir rodando
 *    depois que a seção sai da tela.
 *
 * O componente só preenche o elemento pai — quem posiciona é quem o usa.
 */

export type PrismAnimationType = "rotate" | "hover" | "3drotate";

/** Cores da rampa, do mais escuro ao mais claro (hex). */
export interface PrismPalette {
  shadow?: string;
  mid?: string;
  light?: string;
  highlight?: string;
}

export interface PrismProps {
  height?: number;
  baseWidth?: number;
  animationType?: PrismAnimationType;
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
  /** 0 = espectro original do React Bits, 1 = paleta da marca. */
  brandTint?: number;
  palette?: PrismPalette;
  /** Teto do devicePixelRatio. Abaixo de 768px o teto cai para 1. */
  maxDpr?: number;
}

/** "#9ac7b2" → [0.60, 0.78, 0.70] */
function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.trim().replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset,
  noise = 0.01,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = true,
  timeScale = 0.5,
  brandTint = 1,
  palette,
  maxDpr = 1.5,
}: PrismProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Primitivos, para o array de dependências não reagir à identidade dos objetos
  const offX = offset?.x ?? 0;
  const offY = offset?.y ?? 0;

  // Defaults = tokens do @theme em src/app/globals.css (fonte de verdade da paleta)
  const {
    shadow = "#070707", // carbon
    mid = "#084444", // verdant
    light = "#9ac7b2", // sage
    highlight = "#d3dddb", // limestone
  } = palette ?? {};

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const H = Math.max(0.001, height);
    const BW = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    const GLOW = Math.max(0.0, glow);
    const NOISE = Math.max(0.0, noise);
    const SAT = transparent ? 1.5 : 1;
    const SCALE = Math.max(0.001, scale);
    const HUE = hueShift || 0;
    const CFREQ = Math.max(0.0, colorFrequency || 1);
    const BLOOM = Math.max(0.0, bloom || 1);
    const TINT = Math.max(0, Math.min(1, brandTint));
    const RSX = 1;
    const RSY = 1;
    const RSZ = 1;
    const TS = Math.max(0, timeScale || 1);
    const HOVSTR = Math.max(0, hoverStrength || 1);
    const INERT = Math.max(0, Math.min(1, inertia || 0.12));

    // Celular paga o preço do raymarch em cada pixel — DPR 1 lá.
    const dprCap = window.innerWidth < 768 ? 1 : maxDpr;
    const dpr = Math.min(dprCap, window.devicePixelRatio || 1);

    const renderer = new Renderer({ dpr, alpha: transparent, antialias: false });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2  iResolution;
      uniform float iTime;

      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform float uGlow;
      uniform vec2  uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      // Rampa da marca
      uniform float uBrandTint;
      uniform vec3  uCShadow;
      uniform vec3  uCMid;
      uniform vec3  uCLight;
      uniform vec3  uCHigh;

      vec4 tanh4(vec4 x){
        vec4 e2x = exp(2.0*x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p){
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

        float z = 5.0;
        float d = 0.0;

        vec3 p;
        vec4 o = vec4(0.0);

        float centerShift = uCenterShift;
        float cf = uColorFreq;

        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t + 0.0);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += centerShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);

        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);

        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

        if(abs(uHueShift) > 0.0001){
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        // Rampa Dominyum: a luminância do prisma vira paleta da marca.
        // Com uBrandTint = 1 ela substitui o espectro (e portanto uSaturation /
        // uHueShift deixam de ter efeito visível).
        if (uBrandTint > 0.0001) {
          vec3 ramp = mix(uCShadow, uCMid,   smoothstep(0.00, 0.35, L));
          ramp      = mix(ramp,     uCLight, smoothstep(0.35, 0.75, L));
          ramp      = mix(ramp,     uCHigh,  smoothstep(0.75, 1.00, L));
          col = mix(col, ramp, uBrandTint);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `;

    const geometry = new Triangle(gl);
    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);
    const rotBuf = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: iResBuf },
        iTime: { value: 0 },
        uHeight: { value: H },
        uBaseHalf: { value: BASE_HALF },
        uUseBaseWobble: { value: 1 },
        uRot: { value: rotBuf },
        uGlow: { value: GLOW },
        uOffsetPx: { value: offsetPxBuf },
        uNoise: { value: NOISE },
        uSaturation: { value: SAT },
        uScale: { value: SCALE },
        uHueShift: { value: HUE },
        uColorFreq: { value: CFREQ },
        uBloom: { value: BLOOM },
        uCenterShift: { value: H * 0.25 },
        uInvBaseHalf: { value: 1 / BASE_HALF },
        uInvHeight: { value: 1 / H },
        uMinAxis: { value: Math.min(BASE_HALF, H) },
        uPxScale: { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE) },
        uTimeScale: { value: TS },
        uBrandTint: { value: TINT },
        uCShadow: { value: hexToRgb(shadow) },
        uCMid: { value: hexToRgb(mid) },
        uCLight: { value: hexToRgb(light) },
        uCHigh: { value: hexToRgb(highlight) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = offX * dpr;
      offsetPxBuf[1] = offY * dpr;

      // O enquadramento do upstream deriva só da ALTURA. Numa viewport retrato
      // a base do prisma não cabe na largura e o feixe engolfa a tela — então
      // afastamos a câmera conforme o aspecto encolhe.
      const aspect = w / Math.max(1, h);
      const fit = Math.min(1, Math.max(0.62, aspect / 1.5));
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE * fit);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const setMat3FromEuler = (
      yawY: number,
      pitchX: number,
      rollZ: number,
      out: Float32Array
    ) => {
      const cy = Math.cos(yawY),
        sy = Math.sin(yawY);
      const cx = Math.cos(pitchX),
        sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ),
        sz = Math.sin(rollZ);

      out[0] = cy * cz + sy * sx * sz;
      out[1] = cx * sz;
      out[2] = -sy * cz + cy * sx * sz;
      out[3] = -cy * sz + sy * sx * cz;
      out[4] = cx * cz;
      out[5] = sy * sz + cy * sx * cz;
      out[6] = sy * cx;
      out[7] = -sx;
      out[8] = cy * cx;
      return out;
    };

    const NOISE_IS_ZERO = NOISE < 1e-6;

    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * RSX;
    const wY = (0.2 + rnd() * 0.7) * RSY;
    const wZ = (0.1 + rnd() * 0.5) * RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    let yaw = 0,
      pitch = 0,
      roll = 0;
    let targetYaw = 0,
      targetPitch = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // O callback fica sempre no ticker; as duas flags abaixo ligam/desligam o
    // trabalho. Remover um listener de dentro do próprio dispatch do ticker
    // faria o GSAP pular o listener seguinte (o do Lenis) naquele frame.
    let visible = true; // IntersectionObserver — a seção está na tela?
    let awake = true; // o prisma ainda tem o que animar? (modo hover)
    let clock = 0; // só avança enquanto renderiza — sem salto de fase ao voltar
    let last = -1;

    const pointer = { x: 0, y: 0, inside: true };
    const onMove = (e: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      const nx = (e.clientX - ww * 0.5) / (ww * 0.5);
      const ny = (e.clientY - wh * 0.5) / (wh * 0.5);
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      pointer.inside = true;
      awake = true; // cursor novo reacorda o prisma
    };
    const onLeave = () => {
      pointer.inside = false;
      awake = true; // precisa animar de volta ao repouso
    };

    if (animationType === "hover") {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === "3drotate") {
      program.uniforms.uUseBaseWobble.value = 0;
    } else {
      program.uniforms.uUseBaseWobble.value = 1;
    }

    const render = (time: number) => {
      if (!visible || !awake) {
        last = time;
        return;
      }
      if (last < 0) last = time;
      clock += time - last;
      last = time;

      program.uniforms.iTime.value = clock;

      if (animationType === "hover") {
        const maxPitch = 0.6 * HOVSTR;
        const maxYaw = 0.6 * HOVSTR;
        targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
        targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;
        yaw = lerp(yaw, targetYaw, INERT);
        pitch = lerp(pitch, targetPitch, INERT);
        roll = lerp(roll, 0, 0.1);
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);

        if (NOISE_IS_ZERO) {
          const settled =
            Math.abs(yaw - targetYaw) < 1e-4 &&
            Math.abs(pitch - targetPitch) < 1e-4 &&
            Math.abs(roll) < 1e-4;
          if (settled) awake = false;
        }
      } else if (animationType === "3drotate") {
        const t = clock * TS;
        yaw = t * wY;
        pitch = Math.sin(t * wX + phX) * 0.6;
        roll = Math.sin(t * wZ + phZ) * 0.5;
        setMat3FromEuler(yaw, pitch, roll, rotBuf);
      }
      // No modo "rotate" a rotação é a identidade (rotBuf já nasce assim) — o
      // movimento vem só do wobble da base, dentro do shader.

      renderer.render({ scene: mesh });
    };

    gsap.ticker.add(render);

    let io: IntersectionObserver | null = null;
    if (suspendWhenOffscreen) {
      io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
      });
      io.observe(container);
    }

    return () => {
      gsap.ticker.remove(render);
      ro.disconnect();
      io?.disconnect();
      if (animationType === "hover") {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onLeave);
      }
      if (gl.canvas.parentElement === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    height,
    baseWidth,
    animationType,
    glow,
    noise,
    offX,
    offY,
    scale,
    transparent,
    hueShift,
    colorFrequency,
    timeScale,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
    brandTint,
    shadow,
    mid,
    light,
    highlight,
    maxDpr,
  ]);

  return <div ref={containerRef} className="h-full w-full" />;
}
