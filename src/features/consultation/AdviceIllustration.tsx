import type { AdvicePanel } from "@/content/advice";

/** Illustrations au trait (dessinées pour le site), une par conseil de préparation. */
export function AdviceIllustration({ id, className = "" }: { id: AdvicePanel["id"]; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="var(--color-bronze-light)" opacity="0.28" />
      {id === "infos" ? (
        <g {...common}>
          <rect x="27" y="20" width="38" height="52" rx="6" />
          <path d="M35 33h22M35 41h22M35 49h14" />
          <path d="M59 58l12-12 4 4-12 12-6 2z" />
          <path d="M27 28h-4M27 40h-4M27 52h-4M27 64h-4" />
        </g>
      ) : id === "documents" ? (
        <g {...common}>
          <path d="M33 26h22l10 10v36a4 4 0 0 1-4 4H33a4 4 0 0 1-4-4V30a4 4 0 0 1 4-4z" />
          <path d="M55 26v10h10" />
          <path d="M37 46h20M37 54h20M37 62h12" />
          <path d="M25 34v34a6 6 0 0 0 6 6h24" opacity="0.6" />
        </g>
      ) : id === "tenue" ? (
        <g {...common}>
          <path d="M38 24c2 5 6 7 10 7s8-2 10-7l14 7-5 13-6-3v31H35V41l-6 3-5-13z" />
          <path d="M42 24c1 3 3 4 6 4s5-1 6-4" />
        </g>
      ) : (
        <g {...common}>
          <path d="M48 72s-17-15-17-28a17 17 0 0 1 34 0c0 13-17 28-17 28z" />
          <circle cx="48" cy="44" r="6" />
          <path d="M24 76c8-3 16-3 24 0s16 3 24 0" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}
