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

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function centeredRandom(): number {
  return Math.random() + Math.random() - 1;
}

function wrap(value: number, min: number, max: number): number {
  const span = max - min;
  return ((((value - min) % span) + span) % span) + min;
}

function getParticleCount(width: number, reducedMotion: boolean): number {
  if (reducedMotion) return width < 768 ? 18000 : 28000;
  return width < 768 ? 32000 : 54000;
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
  const clusterAnchors = Array.from({ length: 8 }, () => ({
    x: randomBetween(-12, 12),
    y: randomBetween(-7, 5),
    z: randomBetween(-4, 7),
  }));

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

    if (layer < 0.72) {
      baseX = randomBetween(-40, 40);
      baseY = randomBetween(-22, 24);
      baseZ = randomBetween(-24, -1);
      scale = randomBetween(0.45, 1.15);
      alpha = randomBetween(0.11, 0.24);
      tone = randomBetween(0.24, 0.48);
      drift = randomBetween(0.55, 1.45);
      wave = randomBetween(0.24, 0.68);
      sway = randomBetween(0.16, 0.55);
      pulseSpeed = randomBetween(0.35, 0.75);
      pulseAmplitude = randomBetween(0.02, 0.05);
    } else if (layer < 0.93) {
      baseX = randomBetween(-34, 34);
      baseY = randomBetween(-16, 18);
      baseZ = randomBetween(-16, 10);
      scale = randomBetween(0.95, 2.1);
      alpha = randomBetween(0.15, 0.3);
      tone = randomBetween(0.46, 0.74);
      drift = randomBetween(0.8, 1.9);
      wave = randomBetween(0.65, 1.45);
      sway = randomBetween(0.45, 1.3);
      pulseSpeed = randomBetween(0.45, 1.15);
      pulseAmplitude = randomBetween(0.03, 0.08);
    } else if (layer < 0.995) {
      const anchor =
        clusterAnchors[Math.floor(Math.random() * clusterAnchors.length)];
      baseX = anchor.x + centeredRandom() * randomBetween(1.8, 5.8);
      baseY = anchor.y + centeredRandom() * randomBetween(1.6, 4.6);
      baseZ = anchor.z + centeredRandom() * randomBetween(1.2, 4.2);
      scale = randomBetween(1.55, 3.8);
      alpha = randomBetween(0.34, 0.74);
      tone = randomBetween(0.84, 1.0);
      drift = randomBetween(0.35, 0.95);
      wave = randomBetween(1.55, 3.15);
      sway = randomBetween(1.15, 2.9);
      pulseSpeed = randomBetween(0.8, 1.7);
      pulseAmplitude = randomBetween(0.05, 0.12);
    } else {
      baseX = randomBetween(-32, 32);
      baseY = randomBetween(-24, -7);
      baseZ = randomBetween(8, 15);
      scale = randomBetween(2.8, 4.8);
      alpha = randomBetween(0.12, 0.22);
      tone = randomBetween(0.52, 0.82);
      drift = randomBetween(0.28, 0.75);
      wave = randomBetween(0.85, 1.85);
      sway = randomBetween(0.55, 1.4);
      pulseSpeed = randomBetween(0.22, 0.55);
      pulseAmplitude = randomBetween(0.03, 0.07);
    }

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
  points.position.set(0, -1.5, 0);
  points.rotation.set(-0.12, 0.08, -0.06);

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

function updateSandstormField(field: SandstormField, elapsed: number): void {
  const alphaValues = field.alphaAttribute.array as Float32Array;

  for (let index = 0; index < field.baseAlphas.length; index += 1) {
    const offset = index * 3;
    const baseX = field.basePositions[offset];
    const baseY = field.basePositions[offset + 1];
    const baseZ = field.basePositions[offset + 2];
    const phase = field.phaseOffsets[index];
    const drift = field.driftSpeeds[index];
    const wave = field.waveAmplitudes[index];
    const sway = field.swayAmounts[index];
    const pulseSpeed = field.pulseSpeeds[index];
    const pulseAmplitude = field.pulseAmplitudes[index];

    const windX = wrap(baseX - elapsed * drift * 2.8, -46, 46);
    const ribbon = Math.sin(baseY * 0.26 + elapsed * 0.88 + phase) * wave;
    const crest =
      Math.cos(windX * 0.22 - elapsed * 0.62 + phase * 1.45) * sway;
    const shimmer =
      Math.sin(baseZ * 0.28 + elapsed * 1.32 + phase * 2.0) * 0.32;

    field.positions[offset] = windX + ribbon * 0.9 + crest * 0.58;
    field.positions[offset + 1] =
      baseY +
      Math.sin(windX * 0.21 + elapsed * 0.92 + phase * 0.75) *
        (0.55 + wave * 0.48) +
      Math.cos(baseZ * 0.18 + elapsed * 0.58 + phase) * 0.44;
    field.positions[offset + 2] =
      baseZ +
      Math.cos(baseX * 0.11 - elapsed * 0.42 + phase * 2.2) *
        (0.72 + sway * 0.82) +
      ribbon * 0.3 +
      shimmer;

    field.scales[index] =
      field.baseScales[index] *
      (0.98 + Math.sin(elapsed * pulseSpeed + phase * 1.8) * pulseAmplitude);

    const pulse =
      0.84 +
      Math.sin(elapsed * (0.76 + pulseSpeed * 0.28) + phase * 3.2) *
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

  field.points.position.y = -1.5 + Math.sin(elapsed * 0.16) * 0.4;
  field.points.rotation.z = -0.06 + Math.sin(elapsed * 0.11) * 0.05;
  field.points.rotation.x = -0.12 + Math.cos(elapsed * 0.1) * 0.03;

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let disposed = false;
    let renderer: WebGLRenderer | null = null;
    let cleanupResizeObserver: (() => void) | undefined;
    let cleanupScene: (() => void) | undefined;

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

        let field = createSandstormField(
          THREE,
          container.clientWidth || window.innerWidth,
          reduceMotionQuery.matches,
        );
        scene.add(field.points);

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

          if (field.positions.length / 3 !== particleCount) {
            scene.remove(field.points);
            disposeSandstormField(field);
            field = createSandstormField(
              THREE,
              width,
              reduceMotionQuery.matches,
            );
            scene.add(field.points);
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
          cleanupResizeObserver = () => window.removeEventListener("resize", resize);
        }

        const timer = new THREE.Timer();
        timer.connect(document);

        const renderFrame = () => {
          timer.update();
          const elapsed = timer.getElapsed();
          updateSandstormField(field, elapsed);
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
          scene.remove(field.points);
          disposeSandstormField(field);
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
      cleanupScene?.();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
}
