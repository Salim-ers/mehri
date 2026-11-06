"use client";

import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getRegion, type RegionId } from "@/content/anatomy";
import { applyRegionHighlight, captureMaterials } from "../model/highlight";
import { createAnatomyMaterials, createXRayMaterials, XRayScan, type AnatomyLook, type AnatomyMaterials } from "../model/materials";
import { SkeletonAnimator } from "../model/motion";
import { createSkeletonAsync, type SkeletonModel } from "../model/skeleton";
import { configureTouchOrbit } from "../model/touch";
import type { Detail } from "../model/vertebra-geometry";

export interface AtlasSceneProps {
  readonly selected: RegionId | null;
  readonly playing: boolean;
  readonly detail: Detail;
  readonly active: boolean;
  readonly onSelect: (region: RegionId) => void;
  readonly onHover: (region: RegionId | null) => void;
  /** rendu : os ivoire (explorateur) ou radiographique (sélection des zones) */
  readonly look?: AnatomyLook;
  /** vue d'ensemble : caméra par défaut */
  readonly overview?: { position: readonly [number, number, number]; target: readonly [number, number, number] };
  /** désactive l'orbite (vignettes des fiches motifs) */
  readonly interactive?: boolean;
  /** mouvement réduit : pas de balayage, pas d'animation automatique */
  readonly reducedMotion?: boolean;
}

export const SKELETON_SCALE = 1 / 190; // 1 unité ≈ 19 cm
const DEFAULT_OVERVIEW = { position: [0.8, 5.1, 18] as const, target: [0, 4.75, 0] as const };

function Skeleton({
  selected,
  playing,
  onSelect,
  onHover,
  detail,
  look = "bone",
  interactive = true,
  reducedMotion = false,
  overview = DEFAULT_OVERVIEW,
}: Omit<AtlasSceneProps, "active">) {
  const xray = useMemo(() => (look === "xray" ? createXRayMaterials() : null), [look]);
  const materials: AnatomyMaterials = useMemo(() => xray ?? createAnatomyMaterials(), [xray]);
  const scan = useMemo(() => {
    if (!xray) return null;
    const s = new XRayScan(xray.uniforms, 9.6, -0.2, { duration: 2.4, idleEvery: 0 });
    if (reducedMotion) s.showStatic();
    return s;
  }, [xray, reducedMotion]);
  const [model, setModel] = useState<SkeletonModel | null>(null);
  const gl = useThree((st) => st.gl);
  const sceneCamera = useThree((st) => st.camera);
  const scene = useThree((st) => st.scene);

  // construction découpée, hors rendu, puis shaders compilés en parallèle : aucune tâche longue
  useEffect(() => {
    const abort = new AbortController();
    let built: SkeletonModel | null = null;
    createSkeletonAsync(detail, materials, abort.signal)
      .then(async (m) => {
        built = m;
        await gl.compileAsync(m.root, sceneCamera, scene);
        if (abort.signal.aborted) return;
        setModel(m);
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) console.error("Squelette 3D indisponible", e);
      });
    return () => {
      abort.abort();
      // retire d'abord le modèle de la scène, puis libère la mémoire GPU
      setModel(null);
      if (built) for (const g of built.geometries) g.dispose();
    };
  }, [detail, materials, gl, sceneCamera, scene]);
  useEffect(() => () => materials.dispose(), [materials]);

  const animator = useMemo(() => (model ? new SkeletonAnimator(model) : null), [model]);
  const canvas = useThree((st) => st.gl.domElement);
  const controls = useRef<CameraControls>(null);
  const hovered = useRef<RegionId | null>(null);

  // écrans tactiles : défilement à un doigt, rotation à deux doigts
  useEffect(() => {
    if (controls.current && window.matchMedia("(pointer: coarse)").matches) configureTouchOrbit(controls.current, canvas);
  }, [model, canvas]);

  const size = useThree((st) => st.size);
  // cadrages plus larges sur les scènes étroites (portrait, colonne de mise en page)
  const aspect = size.width / Math.max(1, size.height);
  const distanceFactor = aspect < 0.75 ? 2.1 : aspect < 1.1 ? 1.75 : 1.45;

  const originals = useMemo(() => (model ? captureMaterials(model.selectable) : null), [model]);

  // mise en évidence de la région, rapprochement doux de la caméra, mouvement associé
  useEffect(() => {
    if (!originals || !animator) return;
    applyRegionHighlight(originals, materials, selected);
    const cam = selected ? getRegion(selected).camera : overview;
    const k = selected ? distanceFactor : aspect < 0.75 ? 1.3 : 1;
    const [px, py, pz] = cam.position;
    const [tx, ty, tz] = cam.target;
    void controls.current?.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, true);
    animator.setDemo(selected ? getRegion(selected).movement.demo : null);
  }, [selected, originals, materials, animator, overview, distanceFactor, aspect]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    animator?.update(d, playing);
    if (model) scan?.update(d, !reducedMotion);
  });

  const regionOf = (e: ThreeEvent<PointerEvent | MouseEvent>): RegionId | null => {
    const obj = e.object as THREE.Mesh;
    return (obj.userData.region as RegionId | undefined) ?? null;
  };

  return (
    <>
      <group scale={SKELETON_SCALE}>
        {model ? (
          <primitive
            object={model.root}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (!interactive) return;
              e.stopPropagation();
              const r = regionOf(e);
              if (r) onSelect(r);
            }}
            onPointerMove={(e: ThreeEvent<PointerEvent>) => {
              if (!interactive) return;
              e.stopPropagation();
              const r = regionOf(e);
              if (r !== hovered.current) {
                hovered.current = r;
                onHover(r);
                document.body.style.cursor = r ? "pointer" : "";
              }
            }}
            onPointerOut={() => {
              if (!interactive) return;
              hovered.current = null;
              onHover(null);
              document.body.style.cursor = "";
            }}
          />
        ) : null}
      </group>
      {model && look === "bone" ? (
        // ombre de contact : montée une fois le squelette construit (calculée en continu sur appareil puissant)
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.3}
          scale={8}
          blur={2.6}
          far={3}
          resolution={detail === "high" ? 512 : 256}
          frames={detail === "high" ? Infinity : 2}
          color="#3a3330"
        />
      ) : null}
      <CameraControls
        ref={controls}
        makeDefault
        enabled={interactive}
        minDistance={2}
        maxDistance={20}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI * 0.62}
        smoothTime={0.6}
        draggingSmoothTime={0.15}
        dollySpeed={0.4}
        truckSpeed={0}
      />
    </>
  );
}

export default function AtlasScene(props: AtlasSceneProps) {
  const { detail, active, look = "bone" } = props;
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const start = props.overview ?? DEFAULT_OVERVIEW;
  const bone = look === "bone";
  return (
    <Canvas
      aria-hidden="true"
      dpr={detail === "high" ? [1, 1.75] : [1, 1.3]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [...start.position], fov: 32, near: 0.2, far: 80 }}
      gl={{ antialias: detail === "high", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = bone ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      {bone ? (
        <>
          <hemisphereLight args={["#fff7ec", "#8f877b", 0.62]} />
          <directionalLight position={[4, 10, 7]} intensity={1.8} color="#fff4e6" />
          <directionalLight position={[-6, 4, -7]} intensity={1.5} color="#e0b98f" />
          <Environment resolution={detail === "high" ? 128 : 32} frames={1}>
            <Lightformer form="rect" intensity={1.7} position={[0, 8, -6]} scale={[12, 5, 1]} color="#fff6ea" />
            <Lightformer form="ring" intensity={1.3} position={[-6, 3, 4]} scale={4} color="#e2bf98" />
            <Lightformer form="rect" intensity={0.8} position={[7, 2, 3]} scale={[3, 8, 1]} color="#ffffff" />
          </Environment>
        </>
      ) : null}
      <Skeleton {...props} />
    </Canvas>
  );
}
