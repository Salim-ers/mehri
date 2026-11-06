import type { ReactNode } from "react";

interface PlateHeaderProps {
  readonly plate: string;
  readonly latin: string;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  readonly aside?: ReactNode;
  readonly tone?: "light" | "dark";
}

/**
 * En-tête de page façon planche d'atlas : numéro de planche, intitulé latin,
 * titre éditorial qui monte ligne par ligne, règle graduée.
 * `title` accepte un tableau de lignes pour l'animation.
 */
export function PlateHeader({ plate, latin, title, lede, aside, tone = "light" }: PlateHeaderProps) {
  const dark = tone === "dark";
  return (
    <header className={`relative px-[var(--gutter)] pb-12 pt-[calc(var(--header-h)+3.5rem)] md:pb-20 md:pt-[calc(var(--header-h)+6rem)] ${dark ? "on-dark bg-umber text-bone" : ""}`}>
      <div className="mx-auto grid max-w-[110rem] grid-cols-12 gap-x-6 gap-y-8">
        <div className="col-span-12 flex items-center gap-4 md:col-span-3 md:flex-col md:items-start">
          <p className={`caption-mono ${dark ? "text-bronze-light" : "text-bronze-ink"}`}>Planche {plate}</p>
          <p className={`caption-mono italic normal-case tracking-[0.02em] ${dark ? "text-bone/70" : "text-ink-soft"}`} lang="la">
            {latin}
          </p>
        </div>
        <div className="col-span-12 md:col-span-9">
          <h1 className="display line-rise text-[clamp(2.6rem,1.4rem+5.2vw,7.4rem)]">{title}</h1>
          {lede ? <div className="prose-atlas mt-8 max-w-2xl md:mt-10">{lede}</div> : null}
          {aside}
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[110rem] md:mt-16">
        <div className="ruler" />
      </div>
    </header>
  );
}

/** Découpe un titre en lignes animées. */
export function Lines({ lines }: { lines: readonly ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} style={{ ["--i" as string]: i }}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}
