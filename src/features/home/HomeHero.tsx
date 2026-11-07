"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { addTransitionType, startTransition, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PauseIcon, PlayIcon } from "@/components/shared/Icons";
import { SpineDrawing } from "@/components/shared/SpineDrawing";
import { anatomyRegions, type RegionId } from "@/content/anatomy";
import { AnatomyStage, postHeroProgress } from "@/features/anatomy/components/AnatomyStage";
import { HERO_CHAPTERS } from "@/features/anatomy/model/director";
import { useReducedMotion } from "@/hooks/use-environment";

const LABELS = Object.fromEntries(anatomyRegions.map((r) => [r.id, r.label])) as Record<RegionId, string>;

interface Plate {
  readonly src: string;
  readonly className: string;
  readonly depth: number;
}

/**
 * Radiographies sous licence, en panneaux translucides derrière le squelette.
 * Sur mobile, un seul petit panneau : il ne doit pas devenir l'élément LCP à la place du titre.
 */
const PLATES: readonly Plate[] = [
  { src: "/images/anatomie/radiographie-rachis-cervical.jpg", className: "right-[6%] top-[13%] h-[34%] w-[15%] max-md:right-[4%] max-md:top-[12%] max-md:h-[15%] max-md:w-[19%]", depth: 70 },
  { src: "/images/anatomie/radiographie-bassin.jpg", className: "right-[41%] top-[60%] h-[20%] w-[13%] max-lg:hidden", depth: 120 },
  { src: "/images/anatomie/radiographie-genou.jpg", className: "right-[3%] top-[58%] h-[30%] w-[12%] max-md:hidden", depth: 40 },
];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Accueil : la scène 3D reste en place pendant que les chapitres défilent
 * (accroche → nuque → épaule → bassin → radiographie). Le texte de chaque chapitre
 * est rendu côté serveur ; ce composant ne fait que relier le défilement à la scène.
 */
export function HomeHero({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<RegionId | null>(null);

  // défilement → progression des chapitres (aucun calcul hors défilement / redimensionnement)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
    let frame = 0;
    let lastTone = "";
    const measure = () => {
      frame = 0;
      const tops = chapters.map((c) => c.getBoundingClientRect().top);
      let p = 0;
      for (let i = 0; i < tops.length; i++) {
        const top = tops[i] ?? 0;
        const next = tops[i + 1];
        if (top <= 0.5) {
          p = i;
          if (next !== undefined && next > 0) p = i + Math.min(1, -top / Math.max(1, next - top));
        }
      }
      p = Math.min(HERO_CHAPTERS.length - 1, Math.max(0, p));
      postHeroProgress(p);
      const dark = smooth(3.15, 3.85, p);
      el.style.setProperty("--hero-dark", dark.toFixed(3));
      el.style.setProperty("--hero-p", (p * 100).toFixed(1));
      const tone = dark > 0.5 ? "dark" : "light";
      if (tone !== lastTone) {
        lastTone = tone;
        el.dataset.tone = tone;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const explore = (region: RegionId) => {
    startTransition(() => {
      addTransitionType("to-anatomy");
      router.push(`/anatomie?region=${region}`);
    });
  };

  const playing = !paused && !reduced;

  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="hero__glow" aria-hidden="true" />
        {PLATES.map((p) => (
          <div key={p.src} className={`xray-pane ${p.className}`} style={{ "--depth": p.depth } as CSSProperties} aria-hidden="true">
            <Image src={p.src} alt="" fill sizes="(min-width: 768px) 18vw, 28vw" quality={70} />
          </div>
        ))}
        <AnatomyStage
          className="hero__stage"
          priority
          config={{ mode: "hero", look: "bone", region: null, isolate: false, demo: true, playing, hover: true }}
          onHover={setHovered}
          fallback={<SpineDrawing className="h-[70%] max-h-[44rem] w-auto translate-x-[18vw] text-walnut/70 max-md:-translate-y-[18%] max-md:translate-x-0" variant="solid" />}
        >
          {/* clic sur un os : ouvre la région dans l'anatomie (le survol est indiqué ci-dessous) */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={`absolute inset-0 ${hovered ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => hovered && explore(hovered)}
          />
        </AnatomyStage>
        <div className="hero__veil" aria-hidden="true" />
        <p
          className="hover-label glass pointer-events-none absolute bottom-[12%] right-[8%] rounded-full px-4 py-2 text-sm font-semibold max-md:hidden"
          data-visible={hovered ? "true" : "false"}
          aria-hidden="true"
        >
          {hovered ? `${LABELS[hovered]} — cliquer pour explorer` : " "}
        </p>
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          data-stage-ui
          className="glass absolute right-[var(--gutter)] top-[calc(var(--header-h)+0.75rem)] z-10 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold md:px-4 lg:bottom-6 lg:top-auto"
          aria-pressed={paused}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
          <span className="max-md:sr-only">{paused ? "Reprendre l'animation" : "Mettre en pause l'animation"}</span>
        </button>
      </div>
      <div className="hero__chapters">{children}</div>
    </section>
  );
}
