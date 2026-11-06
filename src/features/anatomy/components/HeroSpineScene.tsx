"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState, type RefObject } from "react";
import * as THREE from "three";
import { heroLayout, HeroSpineController } from "../model/hero-controller";
import type { Detail } from "../model/vertebra-geometry";

export interface HeroSpineSceneProps {
  /** progression de sortie de la section (0 → 1), mise à jour hors React */
  readonly progress: RefObject<number>;
  readonly detail: Detail;
  readonly reducedMotion: boolean;
  readonly active: boolean;
  readonly paused: boolean;
  /** appelé lorsque la colonne est construite (fondu d'apparition du canvas) */
  readonly onReady: () => void;
}

function SpineRig({ progress, detail, reducedMotion, paused, onReady }: Omit<HeroSpineSceneProps, "active">) {
  const [controller, setController] = useState<HeroSpineController | null>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const layout = useMemo(() => heroLayout(size.width, size.height), [size.width, size.height]);

  useEffect(() => {
    const abort = new AbortController();
    let built: HeroSpineController | null = null;
    HeroSpineController.create(detail, reducedMotion, abort.signal)
      .then(async (c) => {
        built = c;
        // shaders compilés en parallèle (KHR_parallel_shader_compile) avant le premier rendu
        await gl.compileAsync(c.rig, camera, scene);
        if (abort.signal.aborted) return;
        setController(c);
        onReady();
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
  }, [detail, reducedMotion, onReady, gl, camera, scene]);

  useFrame((state, delta) => {
    controller?.update({
      elapsed: state.clock.elapsedTime,
      delta: Math.min(delta, 0.05),
      progress: progress.current ?? 0,
      paused,
      pointer: state.pointer,
      camera: state.camera,
      scene: state.scene,
      layout,
    });
  });

  return (
    <>
      {controller ? (
        <>
          <primitive object={controller.rig} />
          {/* ombre de contact : montée avec la colonne ; figée après l'entrée sur les appareils modestes */}
          <ContactShadows
            position={[layout.offsetX, -4.15, 0]}
            opacity={0.26}
            scale={8}
            blur={3}
            far={5}
            resolution={detail === "high" ? 512 : 256}
            frames={detail === "high" ? Infinity : 180}
            color="#3a3330"
          />
        </>
      ) : null}
    </>
  );
}

export default function HeroSpineScene(props: HeroSpineSceneProps) {
  const { detail, active } = props;
  return (
    <Canvas
      aria-hidden="true"
      dpr={detail === "high" ? [1, 1.75] : [1, 1.35]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.6, 18], fov: 30, near: 0.5, far: 60 }}
      gl={{ antialias: detail === "high", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
      }}
    >
      {/* reflets d'environnement : appareils puissants uniquement (le calcul PMREM est coûteux) */}
      {detail === "high" ? (
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[0, 6, -6]} scale={[12, 4, 1]} color="#fff6ea" />
          <Lightformer form="ring" intensity={1.4} position={[-5, 1, 4]} scale={3} color="#e2bf98" />
          <Lightformer form="rect" intensity={0.9} position={[6, -2, 3]} scale={[3, 7, 1]} color="#ffffff" />
        </Environment>
      ) : null}
      <SpineRig {...props} />
    </Canvas>
  );
}
