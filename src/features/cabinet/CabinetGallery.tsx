"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon, CloseIcon } from "@/components/shared/Icons";
import type { GalleryScene } from "@/content/media";

/**
 * Galerie du cabinet : grandes photographies d'architecture qui s'empilent au
 * défilement (chaque scène recouvre doucement la précédente), plein écran au clic.
 * Effet purement CSS (scroll-driven animations), désactivé en mouvement réduit.
 */
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
      <div>
        {scenes.map((scene, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={scene.id}
              aria-labelledby={`espace-${scene.id}`}
              className="sticky top-0 flex min-h-[100svh] items-center bg-ivory px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+1.5rem)] shadow-[0_-40px_80px_-50px_rgba(27,29,31,0.35)] first:shadow-none"
            >
              <div className="stack-scene__media wrap grid items-center gap-y-8 lg:grid-cols-12 lg:gap-x-8">
                <div className={`flex justify-center lg:col-span-6 ${flip ? "lg:col-start-1" : "lg:col-start-7 lg:row-start-1"}`}>
                  <button
                    type="button"
                    onClick={(e) => open(i, e.currentTarget)}
                    className="group relative h-[62svh] max-h-[860px] cursor-zoom-in overflow-hidden rounded-[3px] bg-mineral lg:h-[80svh]"
                    style={{ aspectRatio: `${scene.photo.width} / ${scene.photo.height}` }}
                    aria-label={`Agrandir la photographie : ${scene.title}`}
                  >
                    <Image
                      src={scene.photo.src}
                      alt={scene.photo.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 60vw"
                      quality={80}
                      priority={i === 0}
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                      style={{ objectPosition: `${scene.photo.focus[0]}% ${scene.photo.focus[1]}%` }}
                    />
                  </button>
                </div>
                <div className={`lg:col-span-4 ${flip ? "lg:col-start-8" : "lg:col-start-2"} lg:row-start-1`}>
                  <h2 id={`espace-${scene.id}`} className="display text-[clamp(2.1rem,1.4rem+2.6vw,4.2rem)]">
                    {scene.title}
                  </h2>
                  <p className="prose-body mt-5 max-w-md">{scene.text}</p>
                  <p className="mt-6 text-sm text-ink-soft">
                    {i + 1} / {scenes.length}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        aria-label="Galerie plein écran"
        className="lightbox on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-anthracite p-0 text-bone backdrop:bg-anthracite/90"
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
            <p className="text-sm text-bone/80" aria-live="polite">
              {current.title} — {index + 1} / {scenes.length}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} className="flex min-h-11 items-center gap-2 rounded-full border border-bone/25 px-4 text-sm hover:border-bone">
              <CloseIcon /> Fermer
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image key={current.id} src={current.photo.src} alt={current.photo.alt} fill sizes="100vw" quality={90} className="lightbox-img object-contain" />
          </div>
          <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={() => go(-1)} className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-bone/25 hover:border-bone" aria-label="Photographie précédente">
              <ArrowIcon className="h-4 w-4 rotate-180" />
            </button>
            <p className="max-w-2xl text-center text-sm text-bone/75">{current.photo.caption}</p>
            <button type="button" onClick={() => go(1)} className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-bone/25 hover:border-bone" aria-label="Photographie suivante">
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
