import type { ReactNode } from "react";

interface PageIntroProps {
  /** surtitre en clair (jamais de numéro de planche) */
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  /** contenu complémentaire sous le chapeau (liens, boutons) */
  readonly children?: ReactNode;
}

/**
 * En-tête de page éditorial : surtitre, grand titre qui monte ligne par ligne,
 * chapeau. Espaces généreux, aucun séparateur artificiel.
 */
export function PageIntro({ eyebrow, title, lede, children }: PageIntroProps) {
  return (
    <header className="px-[var(--gutter)] pb-14 pt-[calc(var(--header-h)+3.5rem)] md:pb-20 md:pt-[calc(var(--header-h)+6.5rem)]">
      <div className="wrap grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-8">
          {eyebrow ? <p className="eyebrow fade-up" style={{ ["--d" as string]: "0ms" }}>{eyebrow}</p> : null}
          <h1 className="display line-rise mt-6 text-[clamp(2.8rem,1.5rem+5.4vw,7.6rem)]">{title}</h1>
        </div>
        {lede || children ? (
          <div className="fade-up lg:col-span-4 lg:col-start-9 lg:self-end" style={{ ["--d" as string]: "350ms" }}>
            {lede ? <div className="lede text-ink-soft">{lede}</div> : null}
            {children}
          </div>
        ) : null}
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
