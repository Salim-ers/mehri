"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ConsultationStep } from "@/content/site";

/**
 * Chronologie anatomique : un fil vertébral se remplit au fil des quatre temps
 * de la consultation ; chaque temps « allume » un segment (cervical → sacré).
 */
export function ConsultationTimeline({ steps }: { steps: readonly ConsultationStep[] }) {
  const container = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = root.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
        fill.current?.style.setProperty("transform", `scaleY(${p.toFixed(3)})`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6">
      {/* fil vertébral */}
      <div className="col-span-2 hidden md:block lg:col-span-3" aria-hidden="true">
        <div className="sticky top-[calc(var(--header-h)+3rem)] flex h-[70vh] items-stretch gap-6">
          <div className="relative w-px bg-umber/15">
            <span ref={fill} className="absolute inset-0 origin-top scale-y-0 bg-bronze transition-transform duration-150" />
          </div>
          <ol className="flex flex-col justify-between py-2">
            {steps.map((s, i) => (
              <li key={s.number} className={`transition-transform duration-700 ${i === active ? "translate-x-1" : ""}`}>
                <span className={`caption-mono block ${i === active ? "text-bronze-ink" : "text-ink-soft"}`}>{s.number}</span>
                <span className="caption-mono mt-1 hidden text-ink-soft lg:block">{s.segment}</span>
                <span className="mt-2 flex flex-col gap-[3px]">
                  {Array.from({ length: i === 3 ? 1 : 5 }, (_, k) => (
                    <span key={k} className={`block rounded-[2px] transition-colors duration-700 ${i === active ? "bg-bronze" : "bg-umber/30"}`} style={{ width: i === 3 ? 22 : 10 + i * 3 + k, height: i === 3 ? 14 : 3 }} />
                  ))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ol ref={container} className="col-span-12 space-y-28 md:col-span-10 md:space-y-40 lg:col-span-9">
        {steps.map((s, i) => (
          <li key={s.number} data-step={i} className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:order-2" : ""}`}>
              <div className={`relative overflow-hidden bg-stone transition-[clip-path] duration-[1.2s] ease-[var(--ease-atlas)] ${i <= active ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_30%_0)]"} aspect-[4/5]`}>
                <Image
                  src={s.photo.src}
                  alt={s.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  quality={80}
                  className="object-cover"
                  style={{ objectPosition: `${s.photo.focus[0]}% ${s.photo.focus[1]}%` }}
                />
              </div>
            </div>
            <div className={`col-span-12 lg:col-span-5 lg:self-center ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}>
              <p className="display text-[clamp(4rem,2rem+6vw,8rem)] leading-none text-bronze" aria-hidden="true">{s.number}</p>
              <h2 className="display mt-2 text-[clamp(2.2rem,1.4rem+2.8vw,4.2rem)] text-umber"><span className="sr-only">Étape {s.number} : </span>{s.title}</h2>
              <p className="mt-4 font-display text-xl text-ink">{s.summary}</p>
              <div className="prose-atlas mt-6">
                {s.detail.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
