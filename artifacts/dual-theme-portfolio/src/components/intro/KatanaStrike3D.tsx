import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const KATANA_SRC = `${import.meta.env.BASE_URL}katana.png`;

/**
 * KatanaStrike3D — the 180° katana cut, rendered in real 3D.
 *
 * Replaces the old 2D DOM <img> katana (public/katana.png + CSS transforms +
 * GSAP). Now a proper three.js scene: a textured 3D blade (the same uploaded
 * PNG, projected onto a billboarded plane so it reads exactly like the asset),
 * a 3D guard + haft, and a coral ember trail (THREE.Points) bursting from the
 * blade tip at the cut moment.
 *
 * The GSAP master timeline (kept in IntroSequence.tsx) drives the swing via a
 * shared `setKatanaTransform` callback that this component registers on mount.
 * No per-frame rAF loop for the katana — rAF only runs the lightweight ember
 * particle sim when there are live particles.
 *
 * Visual intent (unchanged from the 2D version):
 *   • blade thrusts in from below-right, big + blurred, snaps into focus at
 *     screen centre, raised for the swing
 *   • chamber: blade floats up-right, coiling the 180°
 *   • THE SWING: blade sweeps 140° → -40° (top-right → bottom-left); blade
 *     squeezes (kinetic impact feel) + particles burst from the tip at apex
 *   • follow-through: blade keeps travelling off-screen bottom-left, then
 *     fades out
 *   • screen halves shudder, tilt, fall — overlay backdrop hard-cuts to
 *     transparent so the site shows THROUGH the split (never a black beat)
 *
 * Color palette (unchanged):
 *   • blade/metal: warm off-white / cream (the PNG is a black silhouette on
 *     white → we invert in-shader → luminous silver/cream, exactly matching
 *     the prior 'invert(1) saturate(0)' look)
 *   • handle/guard: dark umber
 *   • ember trail: warm coral (#c84d3d family) — same accent color used for
 *     the 'ready' word and the terminal dots, never an orange streak
 */

// Shared registry so IntroSequence can find the setTransform callback.
const transformRegistry: Array<
  (x: string, y: string, rotation: number, scale: number, opacity: number, blur: number, bladeSqueeze?: number) => void
> = [];

function makeKatanaTexture(url: string): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(document.createElement('canvas'));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  img.crossOrigin = 'anonymous';
  img.onerror = () => {
    // fallback: blank cream blade if the asset fails to load
  };
  img.onload = () => {
    const c = tex.image as HTMLCanvasElement;
    const ctx = c.getContext('2d')!;
    const w = img.naturalWidth || img.width || 1;
    const h = img.naturalHeight || img.height || 1;
    c.width = w;
    c.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum < 128) {
        // dark silhouette pixel → luminous cream/silver
        d[i] = 238;
        d[i + 1] = 236;
        d[i + 2] = 232;
        d[i + 3] = 255;
      } else {
        // light (white bg) → slightly desaturated steel cream
        d[i] = 222;
        d[i + 1] = 218;
        d[i + 2] = 212;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(id, 0, 0);
    tex.needsUpdate = true;
  };
  img.src = url;
  return tex;
}
interface KatanaSceneRef {
  setTransform: (
    x: string,
    y: string,
    rotation: number,
    scale: number,
    opacity: number,
    blur: number,
    bladeSqueeze?: number,
  ) => void;
  dispose: () => void;
}

function buildScene(canvas: HTMLCanvasElement): {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  katanaRef: KatanaSceneRef;
} {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();

  const viewSize = Math.max(window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect / 2,
    viewSize * aspect / 2,
    viewSize / 2,
    -viewSize / 2,
    0.1,
    1000,
  );
  const tex = makeKatanaTexture(KATANA_SRC);
  const bladeMat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    side: THREE.DoubleSide,
    roughness: 0.35,
    metalness: 0.85,
    color: 0xffffff,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const bladeGeo = new THREE.PlaneGeometry(0.12, 1.35);
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.z = 0.02;
  katanaGroup.add(blade);

  const guardMat = new THREE.MeshStandardMaterial({
    color: 0x2a1d14,
    roughness: 0.6,
    metalness: 0.5,
  });
  const guardGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.045, 20);
  const guard = new THREE.Mesh(guardGeo, guardMat);
  guard.position.y = -0.62;
  guard.rotation.x = Math.PI / 2;
  katanaGroup.add(guard);

  const haftMat = new THREE.MeshStandardMaterial({
    color: 0x2a1d14,
    roughness: 0.7,
    metalness: 0.15,
  });
  const haftGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.22, 12);
  const haft = new THREE.Mesh(haftGeo, haftMat);
  haft.position.y = -0.74;
  haft.rotation.x = Math.PI / 2;
  katanaGroup.add(haft);

  for (let i = -0.78; i <= -0.66; i += 0.06) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.008, 6, 14),
      new THREE.MeshStandardMaterial({
        color: 0x1a110b,
        roughness: 0.9,
        metalness: 0.05,
      }),
    );
    ring.position.y = i;
    ring.rotation.x = Math.PI / 2;
    katanaGroup.add(ring);
  }

  scene.add(katanaGroup);

  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight(0xfff4e6, 1.05);
  key.position.set(1, 1.4, 2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xcfe0ee, 0.55);
  fill.position.set(-1.2, 0.4, 1.6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xdfe5ec, 0.35);
  rim.position.set(0, -1.8, -1);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0x20262e, 0.55));

  const katanaGroup = new THREE.Group();

