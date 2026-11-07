"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { ArrowIcon, CloseIcon, PlusIcon } from "@/components/shared/Icons";
import { Reveal } from "@/components/shared/Reveal";
import type { GalleryScene, Photo } from "@/content/media";

interface Detail {
  readonly photo: Photo;
  readonly focus: readonly [number, number];
  readonly zoom: number;
  readonly label: string;
}

export interface TourScene extends GalleryScene {
  /** recadrage de détail dans une photographie réelle (jamais d'image générée) */
  readonly detail?: Detail;
}

/** Fenêtre photographique : bouton plein écran, cadrage par point focal, aucune déformation. */
function Window({ photo, focus, zoom = 1, sizes, className, onOpen, label, grow = false }: { photo: Photo; focus?: readonly [number, number]; zoom?: number; sizes: string; className: string; onOpen: (el: HTMLButtonElement) => void; label: string; grow?: boolean }) {
  const [fx, fy] = focus ?? photo.focus;
  return (
    <button type="button" onClick={(e) => onOpen(e.currentTarget)} className={`group relative block overflow-hidden rounded-panel bg-sand text-left ${grow ? "tour-grow" : ""} ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        quality={80}
        className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-[1.03]"
        style={{ objectPosition: `${fx}% ${fy}%`, scale: zoom !== 1 ? String(zoom) : undefined, transformOrigin: `${fx}% ${fy}%` }}
      />
      <span className="glass absolute bottom-4 right-4 flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold opacity-90 transition-opacity group-hover:opacity-100">
        <PlusIcon /> {label}
      </span>
    </button>
  );
}

/**
 * Visite photographique du cabinet : chaque espace a sa propre composition
 * (grande fenêtre qui s'ouvre au défilement, détail en décalé, profondeur),
 * plein écran au clic avec navigation clavier, boutons et glisser.
 */
export function CabinetGallery({ scenes }: { scenes: readonly TourScene[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const touch = useRef<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const open = (i: number, el: HTMLButtonElement) => {
    opener.current = el;
    setIndex(i);
    dialog.current?.showModal();
  };
  const go = useCallback(
    (delta: number) => {
      setDir(delta > 0 ? "next" : "prev");
      setIndex((i) => (i + delta + scenes.length) % scenes.length);
    },
    [scenes.length],
  );

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

  const current = scenes[index];
  const onTouchStart = (e: TouchEvent) => {
    touch.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    const end = e.changedTouches[0]?.clientX;
    touch.current = null;
    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
    go(end < start ? 1 : -1);
  };

  return (
    <>
      <div className="space-y-28 md:space-y-40">
        {scenes.map((scene, i) => {
          const flip = i % 2 === 1;
          return (
            <section key={scene.id} aria-labelledby={`espace-${scene.id}`} className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              <div className={`relative lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}>
                <Window
                  photo={scene.photo}
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  className={`mx-auto aspect-[4/5] w-full max-w-[36rem] ${flip ? "lg:ml-auto lg:mr-0" : "lg:ml-0"}`}
                  onOpen={(el) => open(i, el)}
                  label="Plein écran"
                  grow
                />
                {scene.detail ? (
                  <div className={`parallax-soft absolute -bottom-10 w-[42%] max-w-[15rem] ${flip ? "-left-2 lg:left-0" : "-right-2 lg:right-4"}`}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-card border-4 border-ivory shadow-lift">
                      <Image
                        src={scene.detail.photo.src}
                        alt={`Détail : ${scene.detail.label}`}
                        fill
                        sizes="15rem"
                        quality={80}
                        className="object-cover"
                        style={{ objectPosition: `${scene.detail.focus[0]}% ${scene.detail.focus[1]}%`, scale: String(scene.detail.zoom), transformOrigin: `${scene.detail.focus[0]}% ${scene.detail.focus[1]}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <Reveal className={`lg:col-span-4 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                <p className="eyebrow">Visite du cabinet</p>
                <h2 id={`espace-${scene.id}`} className="display mt-5 text-[clamp(2.2rem,1.5rem+2.6vw,4rem)]">
                  {scene.title}
                </h2>
                <p className="prose-body mt-5">{scene.text}</p>
                {scene.detail ? <p className="mt-4 text-sm text-ink-soft">Détail : {scene.detail.label}.</p> : null}
              </Reveal>
            </section>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        aria-label="Photographies du cabinet en plein écran"
        className="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-4">
              <p className="text-sm text-mist" aria-live="polite">
                {index + 1} / {scenes.length} — {current.title}
              </p>
              <button type="button" onClick={() => dialog.current?.close()} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-bone/10">
                <CloseIcon /> Fermer
              </button>
            </div>
            <div className="lightbox-frame relative flex-1" data-dir={dir} key={`${index}-${dir}`}>
              <Image src={current.photo.src} alt={current.photo.alt} fill sizes="100vw" quality={85} className="object-contain" />
            </div>
            <div className="flex items-center justify-center gap-3 px-[var(--gutter)] py-5">
              <button type="button" onClick={() => go(-1)} aria-label="Photographie précédente" className="icon-btn bg-bone/10 hover:bg-bone/20">
                <ArrowIcon className="h-4 w-4 rotate-180" />
              </button>
              <p className="max-w-xl px-2 text-center text-sm text-mist">{current.photo.caption}</p>
              <button type="button" onClick={() => go(1)} aria-label="Photographie suivante" className="icon-btn bg-bone/10 hover:bg-bone/20">
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
