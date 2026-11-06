"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import type { GalleryScene } from "@/content/media";

/** Compositions éditoriales variées : jamais deux scènes identiques à la suite. */
const LAYOUTS = [
  { photo: "col-span-12 lg:col-span-7 lg:col-start-6 h-[80svh] lg:h-[92vh]", text: "col-span-12 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:self-end", aspect: undefined },
  { photo: "col-span-12 sm:col-span-8 lg:col-span-5 lg:col-start-2 h-[72svh] lg:h-[84vh]", text: "col-span-12 lg:col-span-4 lg:col-start-8 lg:self-center", aspect: undefined },
  { photo: "col-span-12 lg:col-span-6 lg:col-start-4 h-[78svh] lg:h-[96vh]", text: "col-span-12 lg:col-span-3 lg:col-start-10 lg:self-end", aspect: undefined },
  { photo: "col-span-10 sm:col-span-6 lg:col-span-4 lg:col-start-7 h-[64svh] lg:h-[74vh]", text: "col-span-12 lg:col-span-4 lg:col-start-2 lg:row-start-1 lg:self-center", aspect: undefined },
  { photo: "col-span-10 col-start-3 sm:col-span-6 sm:col-start-6 lg:col-span-4 lg:col-start-3 h-[64svh] lg:h-[74vh]", text: "col-span-12 lg:col-span-4 lg:col-start-8 lg:self-end", aspect: undefined },
] as const;

export function CabinetGallery({ scenes }: { scenes: readonly GalleryScene[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const open = (i: number, el: HTMLButtonElement) => {
    opener.current = el;
    setIndex(i);
    dialog.current?.showModal();
  };
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + scenes.length) % scenes.length), [scenes.length]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const onClose = () => opener.current?.focus();
    window.addEventListener("keydown", onKey);
    d.addEventListener("close", onClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      d.removeEventListener("close", onClose);
    };
  }, [go]);

  const current = scenes[index]!;

  return (
    <>
      <div className="space-y-28 md:space-y-44">
        {scenes.map((scene, i) => {
          const layout = LAYOUTS[i % LAYOUTS.length]!;
          return (
            <section key={scene.id} aria-labelledby={`espace-${scene.id}`} className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-8">
              <div className={`relative ${layout.photo}`}>
                <Reveal variant="mask" className="h-full">
                  <button
                    type="button"
                    onClick={(e) => open(i, e.currentTarget)}
                    className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-stone"
                    aria-label={`Agrandir la photographie : ${scene.title}`}
                  >
                    <Image
                      src={scene.photo.src}
                      alt={scene.photo.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      quality={80}
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-atlas)] group-hover:scale-[1.04]"
                      style={{ objectPosition: `${scene.photo.focus[0]}% ${scene.photo.focus[1]}%` }}
                    />
                    <span className="caption-mono absolute bottom-4 right-4 rounded-full bg-umber/70 px-3 py-1.5 text-bone opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Plein écran ⤢
                    </span>
                  </button>
                </Reveal>
              </div>
              <Reveal className={layout.text} delay={150}>
                <p className="caption-mono text-bronze-ink">
                  Espace {scene.index} · {String(i + 1).padStart(2, "0")}/{String(scenes.length).padStart(2, "0")}
                </p>
                <h2 id={`espace-${scene.id}`} className="display mt-4 text-[clamp(2rem,1.3rem+2.4vw,3.8rem)] text-umber">
                  {scene.title}
                </h2>
                <p className="prose-atlas mt-5 max-w-md">{scene.text}</p>
              </Reveal>
            </section>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        aria-label="Galerie plein écran"
        className="lightbox on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-graphite p-0 text-bone backdrop:bg-graphite/90"
        onTouchStart={(e) => {
          touch.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          const end = e.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(end - start) > 50) go(end < start ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-[var(--gutter)] py-4">
            <p className="caption-mono text-bronze-light" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")} — {current.title}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} className="flex min-h-11 items-center gap-2 rounded-full border border-bone/25 px-4 text-sm hover:border-bone">
              <span aria-hidden="true">×</span> Fermer
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image key={current.id} src={current.photo.src} alt={current.photo.alt} fill sizes="100vw" quality={90} className="lightbox-img object-contain" />
          </div>
          <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={() => go(-1)} className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-bone/25 hover:border-bone" aria-label="Photographie précédente">
              ←
            </button>
            <p className="max-w-2xl text-center text-sm text-bone/75">{current.photo.caption}</p>
            <button type="button" onClick={() => go(1)} className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-bone/25 hover:border-bone" aria-label="Photographie suivante">
              →
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
