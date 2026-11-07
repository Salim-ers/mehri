import Image from "next/image";
import type { Photo as PhotoData } from "@/content/media";
import { Reveal } from "./Reveal";

interface PhotoProps {
  readonly photo: PhotoData;
  /** taille d'affichage pour le choix de variante responsive */
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  /** légende discrète sous l'image */
  readonly caption?: boolean | string;
  /** ouverture en fenêtre arrondie à l'entrée dans l'écran */
  readonly reveal?: boolean;
  readonly delay?: number;
  readonly focus?: readonly [number, number];
  readonly zoom?: number;
  /** léger mouvement de profondeur au défilement (CSS, désactivé en mouvement réduit) */
  readonly parallax?: boolean;
  readonly radius?: "panel" | "card" | "soft" | "none";
}

const RADIUS = { panel: "rounded-panel", card: "rounded-card", soft: "rounded-soft", none: "" } as const;

/**
 * Photographie du cabinet (lieux vides, matériel) dans une fenêtre arrondie :
 * cadrage par point focal, jamais déformée (object-fit: cover).
 */
export function Photo({ photo, sizes, className = "", priority = false, caption = false, reveal = true, delay = 0, focus, zoom = 1, parallax = false, radius = "panel" }: PhotoProps) {
  const [fx, fy] = focus ?? photo.focus;
  const img = (
    <div className={`relative h-full w-full overflow-hidden bg-sand ${RADIUS[radius]}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        className={`object-cover ${parallax ? "parallax-img" : ""}`}
        style={{ objectPosition: `${fx}% ${fy}%`, scale: zoom !== 1 ? String(zoom) : undefined, transformOrigin: `${fx}% ${fy}%` }}
      />
    </div>
  );
  const captionText = typeof caption === "string" ? caption : photo.caption;
  // une image prioritaire (au-dessus de la ligne de flottaison) n'est jamais masquée : LCP immédiat
  const masked = reveal && !priority;
  return (
    <figure className={`flex flex-col ${className}`}>
      {masked ? (
        <Reveal variant="mask" delay={delay} className="relative min-h-0 flex-1">
          {img}
        </Reveal>
      ) : (
        <div className="relative min-h-0 flex-1">{img}</div>
      )}
      {caption ? <figcaption className="mt-3 text-[0.82rem] text-ink-soft">{captionText}</figcaption> : null}
    </figure>
  );
}
