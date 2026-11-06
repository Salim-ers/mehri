"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback((cb: () => void) => subscribeMedia(query)(cb), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export type WebGLSupport = "pending" | "supported" | "unsupported";

let cachedWebGL: WebGLSupport | null = null;

/** Rendu logiciel (pas de GPU) : la 3D serait saccadée et bloquerait la page. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;

export function detectWebGL(): WebGLSupport {
  if (cachedWebGL) return cachedWebGL;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("no-webgl")) {
      cachedWebGL = "unsupported";
      return cachedWebGL;
    }
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      cachedWebGL = "unsupported";
    } else {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      // « ?force-webgl » : tests automatisés sur machines sans GPU
      cachedWebGL = SOFTWARE_RENDERER.test(renderer) && !params.has("force-webgl") ? "unsupported" : "supported";
    }
    // libère immédiatement le contexte de test
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedWebGL = "unsupported";
  }
  return cachedWebGL;
}

/** Détection WebGL côté client uniquement (rendu serveur : « pending »). */
export function useWebGLSupport(): WebGLSupport {
  return useSyncExternalStore(
    () => () => undefined,
    detectWebGL,
    () => "pending",
  );
}

export type DeviceTier = "high" | "low";

interface NavigatorHints {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean };
}

export function detectDeviceTier(): DeviceTier {
  const nav = navigator as Navigator & NavigatorHints;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  if (saveData || lowMem || (coarse && narrow) || lowCpu) return "low";
  return "high";
}

export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    () => () => undefined,
    detectDeviceTier,
    () => "low",
  );
}

/**
 * Vrai une fois la page chargée et le fil principal inactif : la 3D ne concurrence
 * jamais l'affichage du texte (LCP) ni les premières interactions.
 */
export function useIdleAfterLoad(timeout = 1500): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idle = 0;
    const schedule = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => setReady(true), { timeout }) : window.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [timeout]);
  return ready;
}

/** Vrai lorsque l'élément est (presque) visible — sert à suspendre les rendus WebGL hors écran. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "200px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
