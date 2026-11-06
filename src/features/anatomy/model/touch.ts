import { CameraControlsImpl } from "@react-three/drei";

/**
 * Écrans tactiles : un doigt fait défiler la page (aucun piège de défilement),
 * deux doigts font pivoter / zoomer la caméra.
 */
export function configureTouchOrbit(controls: CameraControlsImpl, canvas: HTMLCanvasElement): void {
  const { ACTION } = CameraControlsImpl;
  controls.touches.one = ACTION.NONE;
  controls.touches.two = ACTION.TOUCH_DOLLY_ROTATE;
  controls.touches.three = ACTION.NONE;
  canvas.style.touchAction = "pan-y";
}
