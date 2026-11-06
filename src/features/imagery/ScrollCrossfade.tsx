"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Imagery } from "@/content/imagery";

export interface CrossfadeItem {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly href: string;
  readonly image: Imagery;
}

/**
 * Défilement narratif : sur grand écran, un cadre « radiographique » reste en
 * place et ses images se succèdent en fondu enchaîné, au rythme des textes.
 * Sur mobile, chaque texte porte sa propre image. Contenu entièrement présent
 * dans le HTML ; aucune animation n'est nécessaire à la lecture.
 */
export function ScrollCrossfade({ items, className = "" }: { items: readonly CrossfadeItem[]; className?: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index ?? 0));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = items[active] ?? items[0];

  return (
    <div className={`grid gap-y-16 lg:grid-cols-12 lg:gap-x-8 ${className}`}>
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2.5rem)]">
          <div className="xray-frame relative aspect-[4/5] max-h-[78vh] w-full overflow-hidden rounded-[4px]">
            <div className="crossfade absolute inset-0">
              {items.map((item, i) => (
                <div key={item.id} data-active={i === active} className="absolute inset-0" aria-hidden={i !== active}>
                  <Image
                    src={item.image.src}
                    alt={i === active ? item.image.alt : ""}
                    fill
                    sizes="(min-width: 1024px) 46vw, 0px"
                    className="xray-img object-cover"
                    style={{ objectPosition: "50% 50%" }}
                  />
                </div>
              ))}
            </div>
            <div key={active} className="scan-sweep is-running" aria-hidden="true" />
          </div>
          {current ? <ImageCredit image={current.image} /> : null}
        </div>
      </div>

      <ol className="lg:col-span-5 lg:col-start-8">
        {items.map((item, i) => (
          <li
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className={`flex flex-col justify-center border-t border-ink/10 py-10 transition-colors duration-700 lg:min-h-[64vh] lg:border-l lg:border-t-0 lg:py-0 lg:pl-10 ${
              i === active ? "lg:border-bronze" : "lg:border-ink/10"
            }`}
          >
            <div className="xray-frame relative mb-8 aspect-[4/3] overflow-hidden rounded-[4px] lg:hidden">
              <Image src={item.image.src} alt={item.image.alt} fill sizes="100vw" className="xray-img object-cover" />
            </div>
            {/* repère de lecture : teinte et filet bronze (contraste WCAG conservé, pas d'opacité réduite) */}
            <h3 className={`display text-[clamp(2rem,1.5rem+2vw,3.4rem)] transition-colors duration-700 ${i === active ? "text-ink" : "lg:text-ink-soft"}`}>{item.title}</h3>
            <p className="prose-body mt-5 max-w-md">{item.text}</p>
            <Link href={item.href} className="link-more mt-7 text-ink">
              Voir les motifs<span className="sr-only"> : {item.title}</span>
            </Link>
            <div className="lg:hidden">
              <ImageCredit image={item.image} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const IMAGE_KIND: Record<Imagery["kind"], string> = {
  radiographie: "Radiographie d'illustration, sans lien avec un patient du cabinet",
  "piece-anatomique": "Pièce anatomique de collection",
  illustration: "Gravure anatomique",
};

export function ImageCredit({ image, tone = "light" }: { image: Imagery; tone?: "light" | "dark" }) {
  return (
    <p className={`mt-3 text-[0.75rem] leading-snug ${tone === "dark" ? "text-bone/60" : "text-ink-soft"}`}>
      {IMAGE_KIND[image.kind]} — 
      {image.credit.author}, {image.credit.license}
    </p>
  );
}
