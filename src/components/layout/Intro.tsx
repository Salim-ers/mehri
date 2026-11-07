"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type CSSProperties } from "react";

/** Instant (ms) de la première ouverture jouée dans cette visite (jamais rejouée lors d'une navigation interne). */
let playedAt: number | null = null;

/** Courbe de la colonne (reprend la ligne du logo) : x(t), y(t) dans un repère 100 × 400. */
function curve(t: number): { x: number; y: number; angle: number } {
  // courbure cervicale, cyphose thoracique, lordose lombaire
  const x = 50 + 15 * Math.sin(t * Math.PI * 2.1 - 0.35) * (0.65 + 0.35 * t);
  const y = 18 + t * 364;
  const dx = 15 * Math.PI * 2.1 * Math.cos(t * Math.PI * 2.1 - 0.35) * (0.65 + 0.35 * t) + 15 * 0.35 * Math.sin(t * Math.PI * 2.1 - 0.35);
  return { x, y, angle: (Math.atan2(364, dx) * 180) / Math.PI - 90 };
}

const POINTS = Array.from({ length: 41 }, (_, i) => curve(i / 40));
const PATH = POINTS.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
const VERTEBRAE = Array.from({ length: 24 }, (_, i) => {
  const t = 0.03 + (i / 23) * 0.9;
  const p = curve(t);
  // les vertèbres grossissent des cervicales vers les lombaires
  return { ...p, w: 9 + t * 9, h: 4.2 + t * 3.4, i };
});

/**
 * Ouverture cinématographique de l'accueil (≈ 2,7 s, jamais bloquante) :
 * A — fond graphite, logo ivoire au reflet bronze, une ligne lumineuse dessine la colonne ;
 * B — les vertèbres apparaissent le long de la ligne, avec une légère rotation ;
 * C — la scène se resserre comme une caméra qui recule et révèle l'accueil ivoire,
 *     où le squelette 3D se matérialise.
 * Rendu côté serveur, disparition 100 % CSS (même sans JavaScript), absente en
 * mouvement réduit, sautée au moindre geste (touche, clic, molette, toucher) et
 * jamais rejouée lors d'une navigation interne.
 */
export function Intro({ name, title, city }: { name: string; title: string; city: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const now = performance.now();
    const firstEntry = root.dataset.entry === "/";
    // retour sur l'accueil (navigation interne) ou arrivée par une autre page : pas d'ouverture
    if (!firstEntry || (playedAt !== null && now - playedAt > 1000)) {
      el.dataset.skip = "true";
      root.classList.remove("intro-on");
      return;
    }
    playedAt ??= now;
    const finish = () => {
      el.dataset.skip = "true";
      root.classList.remove("intro-on");
      cleanup();
    };
    const opening = window.setTimeout(() => {
      el.dataset.done = "true";
    }, 1550);
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === "intro-open") finish();
    };
    const skip = () => finish();
    const events = ["keydown", "wheel", "touchstart", "pointerdown"] as const;
    for (const ev of events) window.addEventListener(ev, skip, { passive: true, once: true });
    el.addEventListener("animationend", onEnd);
    function cleanup() {
      window.clearTimeout(opening);
      for (const ev of events) window.removeEventListener(ev, skip);
      el?.removeEventListener("animationend", onEnd);
    }
    return cleanup;
  }, []);

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <svg className="intro__spine pointer-events-none absolute left-1/2 top-1/2 h-[82vh] w-[20.5vh] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 400" fill="none">
        <defs>
          <linearGradient id="intro-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8bc97" stopOpacity="0" />
            <stop offset="0.25" stopColor="#d8bc97" />
            <stop offset="0.75" stopColor="#b18a63" />
            <stop offset="1" stopColor="#b18a63" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="intro-bone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3e7d6" />
            <stop offset="1" stopColor="#b18a63" />
          </linearGradient>
        </defs>
        <path d={PATH} pathLength={1} stroke="url(#intro-line)" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
        {VERTEBRAE.map((v) => (
          <rect
            key={v.i}
            className="intro__vertebra"
            x={v.x - v.w / 2}
            y={v.y - v.h / 2}
            width={v.w}
            height={v.h}
            rx={v.h / 2}
            fill="url(#intro-bone)"
            opacity={0.55 + (v.i / 23) * 0.25}
            transform={`rotate(${v.angle.toFixed(1)} ${v.x.toFixed(2)} ${v.y.toFixed(2)})`}
            style={{ "--i": v.i } as CSSProperties}
          />
        ))}
      </svg>
      <div className="relative flex flex-col items-center px-6 text-center">
        <span className="intro-logo relative block h-24 w-24 sm:h-28 sm:w-28">
          <Image src="/images/monogramme-clair.png" alt="" fill sizes="112px" priority className="object-contain" />
        </span>
        <p className="intro__wordmark mt-5">{name}</p>
        <p className="intro__title mt-4 text-[0.8rem] font-semibold tracking-[0.18em] text-bronze-light">
          {title.toUpperCase()} · {city.toUpperCase()}
        </p>
      </div>
      <button type="button" tabIndex={-1} className="intro__skip btn btn-ghost btn-sm text-bone">
        Passer
      </button>
    </div>
  );
}
