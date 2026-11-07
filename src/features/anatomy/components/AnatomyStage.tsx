"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { RegionId } from "@/content/anatomy";
import { getWorld, type HostStatus } from "../engine/host";
import type { StageConfig } from "../engine/protocol";

export interface AnatomyStageProps {
  readonly config: StageConfig;
  readonly className?: string;
  /** illustration affichée tant que la 3D n'est pas prête, ou à sa place (sans WebGL) */
  readonly fallback: ReactNode;
  /** chargement anticipé (accueil) plutôt qu'après le chargement complet de la page */
  readonly priority?: boolean;
  /** rotation au glisser, pincement et Ctrl + molette pour zoomer */
  readonly interactive?: boolean;
  readonly onHover?: (region: RegionId | null) => void;
  readonly onStatus?: (status: HostStatus) => void;
  readonly children?: ReactNode;
  readonly label?: string;
}

const subscribeWorld = (cb: () => void) => getWorld().subscribeState(cb);
const worldSnapshot = () => getWorld().snapshot();
const serverSnapshot = () => "idle|0";

function schedule(priority: boolean, run: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const go = () => {
    if (window.requestIdleCallback) idle = window.requestIdleCallback(run, { timeout: priority ? 400 : 1600 });
    else timer = window.setTimeout(run, priority ? 50 : 300);
  };
  // accueil : dès l'hydratation (la 3D vit dans un Worker et ne bloque pas la page) ;
  // ailleurs : après l'évènement « load »
  if (priority || document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

/**
 * Emplacement de la scène anatomique dans une page. Le moteur est partagé par
 * tout le site : ce composant le rattache, lui transmet la configuration et
 * relaie les interactions. Contenu et réservation ne dépendent jamais de la 3D.
 */
export function AnatomyStage({ config, className = "", fallback, priority = false, interactive = false, onHover, onStatus, children, label }: AnatomyStageProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const snap = useSyncExternalStore(subscribeWorld, worldSnapshot, serverSnapshot);
  const [statusPart, shownPart] = snap.split("|");
  const status = (statusPart ?? "idle") as HostStatus;
  const shown = shownPart === "1";

  const getConfig = useEffectEvent(() => config);
  const handleHover = useEffectEvent((region: RegionId | null) => onHover?.(region));
  const handleStatus = useEffectEvent((s: HostStatus) => onStatus?.(s));

  // rattachement pendant la validation du rendu (useLayoutEffect) : lors d'une navigation,
  // la scène est déjà à sa nouvelle place quand la transition de page capture l'état final
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const world = getWorld();
    let detach: (() => void) | null = null;
    const start = () => {
      world.load(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (world.status !== "failed") detach = world.attach(anchor, getConfig());
    };
    let cancel = () => undefined as void;
    if (world.status === "idle") cancel = schedule(priority, start);
    else start();
    return () => {
      cancel();
      detach?.();
    };
  }, [priority]);

  useEffect(() => handleStatus(status), [status]);

  useEffect(() => getWorld().subscribe((msg) => {
    if (msg.t === "hover") handleHover(msg.region);
  }), []);

  // configuration (région, rendu, pause…) : transmise sans re-rattachement
  const { mode, look, region, isolate, demo, playing, hover } = config;
  useEffect(() => {
    if (status === "idle" || status === "failed") return;
    getWorld().update({ mode, look, region, isolate, demo, playing, hover });
  }, [status, mode, look, region, isolate, demo, playing, hover]);

  // survol des os (pointeur fin uniquement), via la fenêtre : les textes superposés ne l'empêchent pas
  useEffect(() => {
    if (!hover || status !== "ready") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const flush = () => {
      frame = 0;
      if (!last) return;
      const r = anchor.getBoundingClientRect();
      const x = ((last.clientX - r.left) / r.width) * 2 - 1;
      const y = -(((last.clientY - r.top) / r.height) * 2 - 1);
      const target = last.target as Element | null;
      // au-dessus d'un texte ou d'un bouton : pas de mise en évidence parasite
      const overUi = !!target?.closest?.("a, button, [data-stage-ui]");
      getWorld().post({ t: "pointer", x, y, inside: Math.abs(x) <= 1 && Math.abs(y) <= 1 && !overUi });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onLeave = () => getWorld().post({ t: "pointer", x: 0, y: 0, inside: false });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      onLeave();
    };
  }, [hover, status]);

  // rotation au glisser (souris, stylet, doigt horizontal), pincement, Ctrl + molette
  useEffect(() => {
    if (!interactive || status !== "ready") return;
    const anchor = anchorRef.current?.parentElement;
    if (!anchor) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button, [data-stage-ui]")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      anchor.setPointerCapture(e.pointerId);
      anchor.dataset.dragging = "true";
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const next = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, next);
      const w = anchor.clientWidth || 1;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        if (!a || !b) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) getWorld().post({ t: "zoom", factor: pinch / d });
        pinch = d;
        return;
      }
      getWorld().post({ t: "drag", dx: (next.x - prev.x) / w, dy: (next.y - prev.y) / w });
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (pointers.size === 0) delete anchor.dataset.dragging;
    };
    // la molette seule fait défiler la page (jamais de piège au défilement) ; Ctrl + molette / pincement de pavé zooment
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      getWorld().post({ t: "zoom", factor: Math.exp(e.deltaY * 0.004) });
    };
    anchor.addEventListener("pointerdown", onDown);
    anchor.addEventListener("pointermove", onMove);
    anchor.addEventListener("pointerup", onUp);
    anchor.addEventListener("pointercancel", onUp);
    anchor.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      anchor.removeEventListener("pointerdown", onDown);
      anchor.removeEventListener("pointermove", onMove);
      anchor.removeEventListener("pointerup", onUp);
      anchor.removeEventListener("pointercancel", onUp);
      anchor.removeEventListener("wheel", onWheel);
      delete anchor.dataset.dragging;
    };
  }, [interactive, status]);

  const state = status === "failed" ? "fallback" : shown ? "shown" : "loading";
  return (
    <div className={`anatomy-stage ${interactive ? "anatomy-stage--interactive" : ""} ${className}`} data-state={state}>
      <div className="anatomy-stage__fallback" aria-hidden={state === "shown" ? true : undefined}>
        {fallback}
      </div>
      {/* l'étiquette porte sur la seule zone de rendu : les commandes superposées restent des boutons */}
      <div ref={anchorRef} className="anatomy-stage__anchor" role={label ? "img" : undefined} aria-label={label} />
      {children}
    </div>
  );
}

/** Envoie la progression des chapitres de l'accueil au moteur. */
export function postHeroProgress(value: number): void {
  getWorld().post({ t: "progress", value });
}

export function postZoom(factor: number): void {
  getWorld().post({ t: "zoom", factor });
}

export function postRecenter(): void {
  getWorld().post({ t: "recenter" });
}
