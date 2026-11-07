import type { Imagery } from "@/content/imagery";

const KIND: Record<Imagery["kind"], string> = {
  radiographie: "Cliché pédagogique",
  illustration: "Illustration ancienne",
  "piece-anatomique": "Pièce anatomique",
};

/**
 * Légende obligatoire de toute image anatomique sous licence : nature de l'image,
 * absence de lien avec un patient du cabinet, auteur et licence.
 */
export function ImageCredit({ image, className = "", tone = "dark" }: { image: Imagery; className?: string; tone?: "dark" | "light" }) {
  return (
    <p className={`text-[0.76rem] leading-snug ${tone === "dark" ? "text-mist" : "text-ink-soft"} ${className}`}>
      {KIND[image.kind]} sans lien avec un patient du cabinet · {image.credit.author},{" "}
      <a href={image.credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline decoration-1 underline-offset-2">
        {image.credit.license}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
      {image.credit.modified ? " · recadrée" : ""}
    </p>
  );
}
