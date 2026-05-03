"use client";

import { useEffect, useRef } from "react";
import type { Mesh, ShaderMaterial, WebGLRenderer } from "three";

type ThreeModule = typeof import("three");

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function canCreateWebGlContext(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

type TopoUniforms = {
  uTime: { value: number };
  uResolution: { value: { set: (x: number, y: number) => void } };
  uPixelRatio: { value: number };
};

function createTopoMesh(THREE: ThreeModule): {
  mesh: Mesh;
  material: ShaderMaterial;
  dispose: () => void;
} {
  // Tunables (start values from the agreed plan)
  const density = 14.0;
  const lineWidthPx = 1.1;
  const opacity = 0.16;
  const baseScale = 0.85;
  const warpScale = 1.25;
  const warpAmp = 0.75;
  const speed = 0.035;

  const uniforms: TopoUniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uPixelRatio;

      // Hash without sine (fast, good enough for value noise)
      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);

        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));

        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float sum = 0.0;
        float amp = 0.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

        for (int i = 0; i < 5; i += 1) {
          sum += amp * valueNoise(p);
          p = m * p;
          amp *= 0.5;
        }

        return sum;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 st = fragCoord / max(uResolution, vec2(1.0));
        vec2 p = st * 2.0 - 1.0;
        p.x *= uResolution.x / max(uResolution.y, 1.0);

        float time = uTime;
        vec2 drift = vec2(time * ${speed.toFixed(5)}, time * ${(
          speed * 0.78
        ).toFixed(5)});
        float rot = time * 0.035;
        mat2 r = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));

        vec2 q = r * (p * ${warpScale.toFixed(3)} + drift * 0.9);
        vec2 warp = vec2(
          fbm(q + vec2(0.0, 7.7)),
          fbm(q + vec2(9.2, 1.3))
        );
        warp = warp * 2.0 - 1.0;

        vec2 warped = p + warp * ${warpAmp.toFixed(3)};
        float field = fbm((r * (warped * ${baseScale.toFixed(3)})) + drift);

        float bands = field * ${density.toFixed(1)};
        float distToLine = abs(fract(bands) - 0.5);
        float aa = fwidth(bands);
        float width = aa * ${lineWidthPx.toFixed(2)};
        float line = 1.0 - smoothstep(width, width + aa, distToLine);

        float radius = length(p);
        float centerFade = 0.35 + 0.65 * smoothstep(0.0, 0.55, radius);
        float edgeFade = 1.0 - smoothstep(0.9, 1.6, radius);
        float alpha = line * ${opacity.toFixed(2)} * centerFade * edgeFade;

        if (alpha < 0.002) {
          discard;
        }

        vec3 color = vec3(0.92);
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  const dispose = () => {
    geometry.dispose();
    material.dispose();
  };

  return { mesh, material, dispose };
}

export function HeroTopographicBackground() {
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
        if (!canCreateWebGlContext()) return;

        const THREE = await import("three");
        if (disposed || !container.isConnected) return;

        const reduceMotionQuery = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const { mesh, material, dispose } = createTopoMesh(THREE);
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        renderer.domElement.setAttribute("aria-hidden", "true");

        container.appendChild(renderer.domElement);

        const resize = () => {
          const width = Math.max(container.clientWidth, window.innerWidth, 1);
          const height = Math.max(container.clientHeight, window.innerHeight, 1);
          const pixelRatio = clamp(
            window.devicePixelRatio || 1,
            1,
            width < 768 ? 1.0 : 1.25,
          );

          renderer?.setPixelRatio(pixelRatio);
          renderer?.setSize(width, height, false);

          const canvas = renderer?.domElement;
          if (!canvas) return;
          material.uniforms.uResolution.value.set(canvas.width, canvas.height);
          material.uniforms.uPixelRatio.value = pixelRatio;
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

        const timer = new THREE.Timer();
        timer.connect(document);

        const renderFrame = () => {
          timer.update();
          material.uniforms.uTime.value = timer.getElapsed();
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
          scene.remove(mesh);
          dispose();
        };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[HeroTopographicBackground] init failed", error);
        }
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
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.30),rgba(0,0,0,0.12)_18%,rgba(0,0,0,0.20)_52%,rgba(0,0,0,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1),transparent_44%)] opacity-35" />
    </div>
  );
}
