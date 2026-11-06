"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type * as THREE from "three";
import { XRaySkeletonController } from "../model/xray-controller";
import type { Detail } from "../model/vertebra-geometry";

export interface XRaySceneProps {
  readonly detail: Detail;
  readonly reducedMotion: boolean;
  /** visible à l'écran (rendu suspendu sinon) */
  readonly active: boolean;
  /** animation suspendue par l'utilisateur */
  readonly paused: boolean;
  readonly onReady: () => void;
}

function Skeleton({ detail, reducedMotion, active, paused, onReady }: XRaySceneProps) {
  const [controller, setController] = useState<XRaySkeletonController | null>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const abort = new AbortController();
    let built: XRaySkeletonController | null = null;
    XRaySkeletonController.create(detail, reducedMotion, abort.signal)
      .then(async (c) => {
        built = c;
        await gl.compileAsync(c.rig, camera, scene);
        if (abort.signal.aborted) return;
        setController(c);
        onReady();
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) console.error("Visualisation radiographique indisponible", e);
      });
    return () => {
      abort.abort();
      setController(null);
      built?.dispose();
    };
  }, [detail, reducedMotion, onReady, gl, camera, scene]);

  // la révélation se rejoue à chaque retour à l'écran
  useEffect(() => {
    if (active) controller?.replay();
  }, [active, controller]);

  useFrame((state, delta) => {
    controller?.update({
      elapsed: state.clock.elapsedTime,
      delta: Math.min(delta, 0.05),
      running: active && !paused,
      pointer: state.pointer,
      camera: state.camera as THREE.PerspectiveCamera,
      viewport: size,
    });
  });

  return controller ? <primitive object={controller.rig} /> : null;
}

export default function XRayScene(props: XRaySceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={props.detail === "high" ? [1, 1.75] : [1, 1.3]}
      frameloop={props.active ? "always" : "never"}
      camera={{ position: [0, 5, 19], fov: 32, near: 0.5, far: 80 }}
      gl={{ antialias: props.detail === "high", alpha: true, powerPreference: "high-performance" }}
    >
      <Skeleton {...props} />
    </Canvas>
  );
}
