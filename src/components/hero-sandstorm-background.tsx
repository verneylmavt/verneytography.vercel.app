"use client";

import { useEffect, useRef } from "react";
import type {
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

type ThreeModule = typeof import("three");

type SandstormField = {
  alphaAttribute: BufferAttribute;
  baseAlphas: Float32Array;
  basePositions: Float32Array;
  baseScales: Float32Array;
  driftSpeeds: Float32Array;
  phaseOffsets: Float32Array;
  points: Points<BufferGeometry, ShaderMaterial>;
  positionAttribute: BufferAttribute;
  positions: Float32Array;
  pulseAmplitudes: Float32Array;
  pulseSpeeds: Float32Array;
  scaleAttribute: BufferAttribute;
  scales: Float32Array;
  swayAmounts: Float32Array;
  waveAmplitudes: Float32Array;
};

type SandstormLayer = {
  field: SandstormField;
  offsetY: number;
  phaseShift: number;
};

type PointerState = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
};

type ScrollState = {
  current: number;
  target: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function centeredRandom(): number {
  return Math.random() + Math.random() - 1;
}

function softCenteredRandom(): number {
  return (centeredRandom() + centeredRandom()) * 0.5;
}

function getParticleCount(width: number, reducedMotion: boolean): number {
  if (reducedMotion) return width < 768 ? 6500 : 9000;
  return width < 768 ? 11000 : 15000;
}

function createMaterial(THREE: ThreeModule): ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute float aScale;
      attribute float aAlpha;
      attribute float aTone;
      varying float vAlpha;
      varying float vTone;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float perspective = clamp(44.0 / -mvPosition.z, 0.95, 3.8);
        gl_PointSize = aScale * perspective;
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = aAlpha;
        vTone = aTone;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vTone;

      void main() {
        vec2 centered = gl_PointCoord - vec2(0.5);
        float distanceToCenter = length(centered);
        float core = smoothstep(0.44, 0.03, distanceToCenter);
        float glow = smoothstep(0.56, 0.18, distanceToCenter) * 0.48;
        float alpha = (core * 0.68 + glow) * vAlpha;

        if (alpha < 0.008) {
          discard;
        }

        gl_FragColor = vec4(vec3(vTone), alpha);
      }
    `,
  });
}

function createSandstormField(
  THREE: ThreeModule,
  width: number,
  reducedMotion: boolean,
): SandstormField {
  const count = getParticleCount(width, reducedMotion);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const baseScales = new Float32Array(count);
  const baseAlphas = new Float32Array(count);
  const alphaValues = new Float32Array(count);
  const toneValues = new Float32Array(count);
  const phaseOffsets = new Float32Array(count);
  const driftSpeeds = new Float32Array(count);
  const waveAmplitudes = new Float32Array(count);
  const swayAmounts = new Float32Array(count);
  const pulseSpeeds = new Float32Array(count);
  const pulseAmplitudes = new Float32Array(count);
  const clusterAnchors = [
    { x: 0, y: 0, z: 0, spreadX: 15, spreadY: 12, spreadZ: 4.5 },
    { x: -12, y: 8, z: -1, spreadX: 9, spreadY: 8, spreadZ: 3.8 },
    { x: 12, y: -8, z: 1, spreadX: 9, spreadY: 8, spreadZ: 3.8 },
    { x: 0, y: 18, z: -1, spreadX: 12, spreadY: 7, spreadZ: 4 },
    { x: 0, y: -18, z: 1, spreadX: 12, spreadY: 7, spreadZ: 4 },
    { x: -22, y: 0, z: -2, spreadX: 7, spreadY: 11, spreadZ: 4.2 },
    { x: 22, y: 0, z: -2, spreadX: 7, spreadY: 11, spreadZ: 4.2 },
  ] as const;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const layer = Math.random();
    let baseX = 0;
    let baseY = 0;
    let baseZ = 0;
    let scale = 1;
    let alpha = 0.14;
    let tone = 0.7;
    let drift = 1.4;
    let wave = 1.1;
    let sway = 1.2;
    let pulseSpeed = 0.8;
    let pulseAmplitude = 0.08;

    if (layer < 0.44) {
      baseX = randomBetween(-40, 40);
      baseY = randomBetween(-38, 38);
      baseZ = randomBetween(-24, -1);
      scale = randomBetween(0.4, 1.0);
      alpha = randomBetween(0.08, 0.18);
      tone = randomBetween(0.24, 0.48);
      drift = randomBetween(0.55, 1.45);
      wave = randomBetween(0.24, 0.68);
      sway = randomBetween(0.16, 0.55);
      pulseSpeed = randomBetween(0.35, 0.75);
      pulseAmplitude = randomBetween(0.02, 0.05);
    } else if (layer < 0.72) {
      baseX = softCenteredRandom() * randomBetween(14, 34);
      baseY = softCenteredRandom() * randomBetween(16, 30);
      baseZ = randomBetween(-18, 9);
      scale = randomBetween(0.8, 1.85);
      alpha = randomBetween(0.12, 0.24);
      tone = randomBetween(0.44, 0.74);
      drift = randomBetween(0.75, 1.7);
      wave = randomBetween(0.72, 1.6);
      sway = randomBetween(0.5, 1.35);
      pulseSpeed = randomBetween(0.45, 1.2);
      pulseAmplitude = randomBetween(0.03, 0.08);
    } else if (layer < 0.88) {
      baseX = softCenteredRandom() * randomBetween(12, 24);
      baseY = softCenteredRandom() * randomBetween(12, 24);
      baseZ = randomBetween(-12, 8);
      scale = randomBetween(1.0, 2.15);
      alpha = randomBetween(0.16, 0.3);
      tone = randomBetween(0.52, 0.8);
      drift = randomBetween(0.5, 1.1);
      wave = randomBetween(1.15, 2.1);
      sway = randomBetween(0.8, 1.85);
      pulseSpeed = randomBetween(0.7, 1.5);
      pulseAmplitude = randomBetween(0.05, 0.11);
    } else if (layer < 0.976) {
      const anchor =
        clusterAnchors[Math.floor(Math.random() * clusterAnchors.length)];
      baseX = anchor.x + softCenteredRandom() * anchor.spreadX;
      baseY = anchor.y + softCenteredRandom() * anchor.spreadY;
      baseZ = anchor.z + softCenteredRandom() * anchor.spreadZ;
      scale = randomBetween(1.2, 2.8);
      alpha = randomBetween(0.24, 0.48);
      tone = randomBetween(0.84, 1.0);
      drift = randomBetween(0.35, 0.95);
      wave = randomBetween(1.55, 3.15);
      sway = randomBetween(1.15, 2.9);
      pulseSpeed = randomBetween(0.8, 1.7);
      pulseAmplitude = randomBetween(0.05, 0.12);
    } else {
      baseX = softCenteredRandom() * randomBetween(14, 32);
      baseY = softCenteredRandom() * randomBetween(18, 32);
      baseZ = randomBetween(8, 15);
      scale = randomBetween(2.2, 3.8);
      alpha = randomBetween(0.08, 0.16);
      tone = randomBetween(0.52, 0.82);
      drift = randomBetween(0.28, 0.75);
      wave = randomBetween(0.85, 1.85);
      sway = randomBetween(0.55, 1.4);
      pulseSpeed = randomBetween(0.22, 0.55);
      pulseAmplitude = randomBetween(0.03, 0.07);
    }

    const centerWeight = Math.max(
      0,
      1 - Math.hypot(baseX / 30, baseY / 26),
    );
    alpha *= 1 + centerWeight * 0.08;
    tone = Math.min(1, tone + centerWeight * 0.02);

    positions[offset] = baseX;
    positions[offset + 1] = baseY;
    positions[offset + 2] = baseZ;
    basePositions[offset] = baseX;
    basePositions[offset + 1] = baseY;
    basePositions[offset + 2] = baseZ;

    scales[index] = scale;
    baseScales[index] = scale;
    baseAlphas[index] = alpha;
    alphaValues[index] = alpha;
    toneValues[index] = tone;
    phaseOffsets[index] = randomBetween(0, Math.PI * 2);
    driftSpeeds[index] = drift;
    waveAmplitudes[index] = wave;
    swayAmounts[index] = sway;
    pulseSpeeds[index] = pulseSpeed;
    pulseAmplitudes[index] = pulseAmplitude;
  }

  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const scaleAttribute = new THREE.BufferAttribute(scales, 1);
  const alphaAttribute = new THREE.BufferAttribute(alphaValues, 1);

  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("aScale", scaleAttribute);
  geometry.setAttribute("aAlpha", alphaAttribute);
  geometry.setAttribute("aTone", new THREE.BufferAttribute(toneValues, 1));

  const points = new THREE.Points(geometry, createMaterial(THREE));
  points.frustumCulled = false;
  points.position.set(0, 0, 0);
  points.rotation.set(-0.04, 0.04, -0.02);

  return {
    alphaAttribute,
    baseAlphas,
    basePositions,
    baseScales,
    driftSpeeds,
    phaseOffsets,
    points,
    positionAttribute,
    positions,
    pulseAmplitudes,
    pulseSpeeds,
    scaleAttribute,
    scales,
    swayAmounts,
    waveAmplitudes,
  };
}

function updateSandstormField(
  field: SandstormField,
  elapsed: number,
  scrollPhase: number,
): void {
  const alphaValues = field.alphaAttribute.array as Float32Array;

  for (let index = 0; index < field.baseAlphas.length; index += 1) {
    const offset = index * 3;
    const baseX = field.basePositions[offset];
    const baseY = field.basePositions[offset + 1];
    const baseZ = field.basePositions[offset + 2];
    const phase = field.phaseOffsets[index];
    const wave = field.waveAmplitudes[index];
    const sway = field.swayAmounts[index];
    const pulseSpeed = field.pulseSpeeds[index];
    const pulseAmplitude = field.pulseAmplitudes[index];
    const flowPhase = elapsed + scrollPhase * 0.9;

    const windX = baseX;
    const ribbon = Math.sin(baseY * 0.26 + flowPhase * 0.88 + phase) * wave;
    const shimmer =
      Math.sin(baseZ * 0.28 + flowPhase * 1.32 + phase * 2.0) * 0.32;

    field.positions[offset] = windX;
    field.positions[offset + 1] =
      baseY +
      Math.sin(windX * 0.21 + flowPhase * 0.92 + phase * 0.75) *
        (0.55 + wave * 0.48) +
      Math.cos(baseZ * 0.18 + flowPhase * 0.58 + phase) * 0.44;
    field.positions[offset + 2] =
      baseZ +
      Math.cos(baseX * 0.11 - flowPhase * 0.42 + phase * 2.2) *
        (0.72 + sway * 0.82) +
      ribbon * 0.3 +
      shimmer;

    field.scales[index] =
      field.baseScales[index] *
      (0.98 +
        Math.sin(flowPhase * pulseSpeed + phase * 1.8) * pulseAmplitude);

    const pulse =
      0.84 +
      Math.sin(flowPhase * (0.76 + pulseSpeed * 0.28) + phase * 3.2) *
        (0.1 + pulseAmplitude * 0.55);
    const depthFade = 1.14 - Math.abs(field.positions[offset + 2]) / 24;
    alphaValues[index] =
      Math.min(
        1,
        field.baseAlphas[index] *
          Math.max(0.34, depthFade * pulse) *
          (0.92 + field.baseScales[index] * 0.014),
      );
  }
  field.positionAttribute.needsUpdate = true;
  field.alphaAttribute.needsUpdate = true;
  field.scaleAttribute.needsUpdate = true;
}

function disposeSandstormField(field: SandstormField): void {
  field.points.geometry.dispose();
  field.points.material.dispose();
}

export function HeroSandstormBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return undefined;

    let disposed = false;
    let renderer: WebGLRenderer | null = null;
    let cleanupResizeObserver: (() => void) | undefined;
    let cleanupScene: (() => void) | undefined;
    let cleanupPointerTracking: (() => void) | undefined;

    const setup = async () => {
      try {
        const THREE = await import("three");
        if (disposed || !container.isConnected) return;

        const reduceMotionQuery = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
        camera.position.set(0, 0, 24);
        camera.lookAt(0, -1.5, 0);
        const pointer: PointerState = {
          currentX: 0,
          currentY: 0,
          targetX: 0,
          targetY: 0,
        };
        const scroll: ScrollState = {
          current: window.scrollY,
          target: window.scrollY,
        };

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 1);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        renderer.domElement.setAttribute("aria-hidden", "true");

        container.appendChild(renderer.domElement);

        const createLayers = (width: number) => {
          const configs = [
            { offsetY: -8, phaseShift: -0.35 },
            { offsetY: 0, phaseShift: 0 },
            { offsetY: 8, phaseShift: 0.35 },
          ];

          return configs.map<SandstormLayer>((config) => {
            const field = createSandstormField(
              THREE,
              width,
              reduceMotionQuery.matches,
            );
            field.points.position.set(0, config.offsetY, 0);
            scene.add(field.points);

            return {
              field,
              offsetY: config.offsetY,
              phaseShift: config.phaseShift,
            };
          });
        };

        let layers = createLayers(
          container.clientWidth || window.innerWidth,
        );

        const resize = () => {
          const width = Math.max(container.clientWidth, window.innerWidth, 1);
          const height = Math.max(container.clientHeight, window.innerHeight, 1);
          const particleCount = getParticleCount(
            width,
            reduceMotionQuery.matches,
          );

          camera.aspect = width / height;
          camera.position.z = width < 768 ? 28 : 24;
          camera.updateProjectionMatrix();

          renderer?.setPixelRatio(
            Math.min(window.devicePixelRatio, width < 768 ? 1.25 : 1.5),
          );
          renderer?.setSize(width, height, false);

          if (layers[0] && layers[0].field.positions.length / 3 !== particleCount) {
            for (const layer of layers) {
              scene.remove(layer.field.points);
              disposeSandstormField(layer.field);
            }
            layers = createLayers(width);
          }
        };

        resize();

        if (typeof ResizeObserver !== "undefined") {
          const resizeObserver = new ResizeObserver(() => {
            resize();
          });
          resizeObserver.observe(container);
          cleanupResizeObserver = () => resizeObserver.disconnect();
        } else {
          window.addEventListener("resize", resize);
          cleanupResizeObserver = () =>
            window.removeEventListener("resize", resize);
        }

        const updateGlow = () => {
          const x = 50 + pointer.currentX * 18;
          const y = 40 + pointer.currentY * 18;
          const pointerDistance = Math.hypot(
            pointer.currentX,
            pointer.currentY,
          );
          const opacity = Math.min(0.16, pointerDistance * 0.18);

          glow.style.opacity = opacity.toFixed(3);
          glow.style.background = [
            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12), rgba(255,255,255,0.05) 14%, rgba(255,255,255,0.018) 28%, transparent 52%)`,
            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.035), transparent 38%)`,
          ].join(",");
        };

        const handlePointerMove = (event: PointerEvent) => {
          const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
          const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
          pointer.targetX = normalizedX;
          pointer.targetY = normalizedY;
        };

        const handlePointerLeave = () => {
          pointer.targetX = 0;
          pointer.targetY = 0;
        };

        const handleScroll = () => {
          scroll.target = window.scrollY;
        };

        window.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
        window.addEventListener("pointerleave", handlePointerLeave, {
          passive: true,
        });
        window.addEventListener("scroll", handleScroll, { passive: true });
        cleanupPointerTracking = () => {
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerleave", handlePointerLeave);
          window.removeEventListener("scroll", handleScroll);
        };

        const timer = new THREE.Timer();
        timer.connect(document);

        const renderFrame = () => {
          timer.update();
          const elapsed = timer.getElapsed();
          pointer.currentX += (pointer.targetX - pointer.currentX) * 0.045;
          pointer.currentY += (pointer.targetY - pointer.currentY) * 0.045;
          scroll.current += (scroll.target - scroll.current) * 0.06;
          const scrollPhase = scroll.current / Math.max(window.innerHeight, 1);

          for (const layer of layers) {
            layer.field.points.position.x = pointer.currentX * 0.2;
            layer.field.points.position.y =
              layer.offsetY +
              Math.sin(elapsed * 0.16 + layer.phaseShift) * 0.16 -
              pointer.currentY * 0.22;
            layer.field.points.rotation.y =
              pointer.currentX * 0.12 + layer.phaseShift * 0.08;
            layer.field.points.rotation.x =
              -0.08 +
              Math.cos(elapsed * 0.1 + layer.phaseShift) * 0.02 +
              pointer.currentY * 0.03;
            layer.field.points.rotation.z =
              -0.03 +
              Math.sin(elapsed * 0.11 + layer.phaseShift) * 0.025 +
              pointer.currentX * 0.02;

            updateSandstormField(
              layer.field,
              elapsed + layer.phaseShift,
              scrollPhase,
            );
          }
          updateGlow();
          renderer?.render(scene, camera);
        };

        if (reduceMotionQuery.matches) {
          renderFrame();
        } else {
          renderer.setAnimationLoop(renderFrame);
        }

        cleanupScene = () => {
          renderer?.setAnimationLoop(null);
          timer.dispose();
          for (const layer of layers) {
            scene.remove(layer.field.points);
            disposeSandstormField(layer.field);
          }
        };
      } catch {
        cleanupResizeObserver = undefined;
        cleanupScene = undefined;
      }
    };

    void setup();

    return () => {
      disposed = true;
      cleanupResizeObserver?.();
      cleanupPointerTracking?.();
      cleanupScene?.();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={containerRef}
        className="absolute inset-0"
      />
      <div
        ref={glowRef}
        className="absolute inset-[-18%] opacity-0 blur-3xl transition-opacity duration-300 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28),rgba(0,0,0,0.1)_18%,rgba(0,0,0,0.18)_52%,rgba(0,0,0,0.32)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1),transparent_44%)] opacity-40" />
    </div>
  );
}
