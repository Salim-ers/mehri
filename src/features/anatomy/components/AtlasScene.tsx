"use client";

import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getRegion, type RegionId } from "@/content/anatomy";
import { applyRegionHighlight, captureMaterials } from "../model/highlight";
import { createAnatomyMaterials } from "../model/materials";
import { configureTouchOrbit } from "../model/touch";
import { SkeletonAnimator } from "../model/motion";
import { createSkeletonAsync, type SkeletonModel } from "../model/skeleton";
import type { Detail } from "../model/vertebra-geometry";

export interface AtlasSceneProps {
  readonly selected: RegionId | null;
  readonly playing: boolean;
  readonly detail: Detail;
  readonly active: boolean;
  readonly onSelect: (region: RegionId) => void;
  readonly onHover: (region: RegionId | null) => void;
  /** vue d'ensemble : caméra par défaut */
  readonly overview?: { position: readonly [number, number, number]; target: readonly [number, number, number] };
  /** désactive l'orbite (vignettes des fiches motifs) */
  readonly interactive?: boolean;
}

export const SKELETON_SCALE = 1 / 190; // 1 unité ≈ 19 cm
const DEFAULT_OVERVIEW = { position: [0.8, 5.1, 18] as const, target: [0, 4.75, 0] as const };

function Skeleton({ selected, playing, onSelect, onHover, detail, interactive = true, overview = DEFAULT_OVERVIEW }: Omit<AtlasSceneProps, "active">) {
  const materials = useMemo(() => createAnatomyMaterials(), []);
  const [model, setModel] = useState<SkeletonModel | null>(null);
  // construction découpée, hors rendu : aucune tâche longue
  useEffect(() => {
    const abort = new AbortController();
    let built: SkeletonModel | null = null;
    createSkeletonAsync(detail, materials, abort.signal)
      .then((m) => {
        built = m;
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
  }, [detail, materials]);
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

  // matériau d'origine de chaque os (pour la mise en évidence)
  const originals = useMemo(() => (model ? captureMaterials(model.selectable) : null), [model]);

  useEffect(() => () => materials.dispose(), [materials]);

  // Mise en évidence de la région et transition de caméra
  useEffect(() => {
    if (!originals || !animator) return;
    applyRegionHighlight(originals, materials, selected);
    const cam = selected ? getRegion(selected).camera : overview;
    const k = selected ? distanceFactor : aspect < 0.75 ? 1.25 : 1;
    const [px, py, pz] = cam.position;
    const [tx, ty, tz] = cam.target;
    controls.current?.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, true);
    animator.setDemo(selected ? getRegion(selected).movement.demo : null);
  }, [selected, originals, materials, animator, overview, distanceFactor, aspect]);

  useFrame((_, delta) => {
    animator?.update(Math.min(delta, 0.05), playing);
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
      <CameraControls
        ref={controls}
        makeDefault
        enabled={interactive}
        minDistance={2}
        maxDistance={20}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI * 0.62}
        smoothTime={0.55}
        draggingSmoothTime={0.15}
        dollySpeed={0.4}
        truckSpeed={0}
      />
    </>
  );
}

export default function AtlasScene(props: AtlasSceneProps) {
  const { detail, active } = props;
  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);
  const start = props.overview ?? DEFAULT_OVERVIEW;
  return (
    <Canvas
      aria-hidden="true"
      dpr={detail === "high" ? [1, 1.75] : [1, 1.3]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [...start.position], fov: 32, near: 0.2, far: 80 }}
      gl={{ antialias: detail === "high", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <hemisphereLight args={["#fff4e6", "#6b5646", 0.6]} />
      <directionalLight position={[4, 10, 7]} intensity={1.7} color="#fff1dc" />
      <directionalLight position={[-6, 4, -7]} intensity={1.6} color="#d6a26a" />
      <Environment resolution={detail === "high" ? 128 : 32} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 8, -6]} scale={[12, 5, 1]} color="#fff2df" />
        <Lightformer form="ring" intensity={1.4} position={[-6, 3, 4]} scale={4} color="#d9a777" />
        <Lightformer form="rect" intensity={0.7} position={[7, 2, 3]} scale={[3, 8, 1]} color="#ffffff" />
      </Environment>
      <Skeleton {...props} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={8} blur={2.4} far={3} resolution={detail === "high" ? 512 : 256} frames={detail === "high" ? Infinity : 1} color="#140e0b" />
    </Canvas>
  );
}
