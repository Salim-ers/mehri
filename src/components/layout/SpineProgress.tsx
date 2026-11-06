"use client";

import { useEffect, useRef } from "react";
import { VERTEBRAE } from "@/features/anatomy/model/spine-profile";

const TICKS = [...VERTEBRAE.map((v) => v.label), "S", "Co"];
const MARKS = new Set(["C1", "T1", "L1", "S"]);

/**
 * « Fil vertébral » : indicateur de lecture signature (≥ 1280 px).
 * Chaque vertèbre s'allume au fil du défilement. Purement décoratif.
 */
export function SpineProgress() {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      ref.current?.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <ol
      ref={ref}
      aria-hidden="true"
      className="spine-progress pointer-events-none fixed left-[calc(var(--gutter)*0.35)] top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-[5px] 2xl:flex"
    >
      {TICKS.map((label, i) => {
        const size = label === "S" ? 18 : label === "Co" ? 6 : 8 + Math.min(i, 23) * 0.22;
        return (
          <li key={label} className="flex items-center gap-2 text-bronze-ink" style={{ ["--i" as string]: i }}>
            <span className="block rounded-[2px] bg-current" style={{ width: size, height: label === "S" ? 10 : 3 }} />
            {MARKS.has(label) ? <span className="caption-mono text-[0.55rem] text-ink-soft">{label}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
