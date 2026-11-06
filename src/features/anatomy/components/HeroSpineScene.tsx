"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState, type RefObject } from "react";
import * as THREE from "three";
import { HeroSpineController } from "../model/hero-controller";
import type { Detail } from "../model/vertebra-geometry";

export interface HeroSpineSceneProps {
  /** progression du défilement dans la section (0 → 1), mise à jour hors React */
  readonly progress: RefObject<number>;
  readonly detail: Detail;
  readonly reducedMotion: boolean;
  readonly active: boolean;
  /** décalage horizontal de la colonne (composition asymétrique) */
  readonly offsetX: number;
  /** flottement suspendu par l'utilisateur */
  readonly paused: boolean;
  /** légendes DOM positionnées par projection (évite un second arbre React) */
  readonly labels: { readonly cervical: RefObject<HTMLDivElement | null>; readonly lumbar: RefObject<HTMLDivElement | null> };
}

function SpineRig({ progress, detail, reducedMotion, offsetX, labels, paused }: Omit<HeroSpineSceneProps, "active">) {
  const [controller, setController] = useState<HeroSpineController | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    let built: HeroSpineController | null = null;
    HeroSpineController.create(detail, reducedMotion, offsetX, abort.signal)
      .then((c) => {
        built = c;
        setController(c);
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) console.error("Colonne 3D indisponible", e);
      });
    return () => {
      abort.abort();
      // retire d'abord le modèle de la scène, puis libère la mémoire GPU
      setController(null);
      built?.dispose();
    };
  }, [detail, reducedMotion, offsetX]);

  useFrame((state, delta) => {
    if (!controller) return;
    controller.update({
      elapsed: state.clock.elapsedTime,
      delta,
      progress: progress.current ?? 0,
      paused,
      pointer: state.pointer,
      camera: state.camera,
      viewport: state.size,
      labels: { cervical: labels.cervical.current, lumbar: labels.lumbar.current },
    });
  });

  return controller ? <primitive object={controller.rig} /> : null;
}

export default function HeroSpineScene(props: HeroSpineSceneProps) {
  const { detail, active } = props;
  return (
    <Canvas
      aria-hidden="true"
      dpr={detail === "high" ? [1, 1.75] : [1, 1.3]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.6, 17], fov: 30, near: 0.5, far: 60 }}
      gl={{ antialias: detail === "high", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <hemisphereLight args={["#fff6ea", "#b8a486", 0.55]} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} color="#fff3e2" />
      <directionalLight position={[-6, 3, -6]} intensity={1.4} color="#d6a26a" />
      <pointLight position={[2, -2, 4]} intensity={6} distance={14} color="#e8c39b" />
      <Environment resolution={detail === "high" ? 128 : 32} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -6]} scale={[10, 4, 1]} color="#fff4e4" />
        <Lightformer form="ring" intensity={1.6} position={[-5, 1, 3]} scale={3} color="#d9a777" />
        <Lightformer form="rect" intensity={0.8} position={[6, -2, 2]} scale={[3, 6, 1]} color="#ffffff" />
      </Environment>
      <SpineRig {...props} />
      <ContactShadows
        position={[props.offsetX, -4.3, 0]}
        opacity={0.32}
        scale={9}
        blur={2.8}
        far={6}
        resolution={detail === "high" ? 512 : 256}
        frames={detail === "high" ? Infinity : 1}
        color="#3b2418"
      />
    </Canvas>
  );
}
