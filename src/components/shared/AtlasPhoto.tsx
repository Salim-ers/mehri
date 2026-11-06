import Image from "next/image";
import type { Photo } from "@/content/media";
import { Reveal } from "./Reveal";

interface AtlasPhotoProps {
  readonly photo: Photo;
  /** taille d'affichage pour le choix de variante responsive */
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  readonly caption?: boolean | string;
  readonly figureNumber?: string;
  readonly reveal?: boolean;
  readonly delay?: number;
  readonly focus?: readonly [number, number];
  readonly zoom?: number;
  readonly aspect?: string;
}

/**
 * Photographie éditoriale : cadrage par point focal, masque d'ouverture,
 * légende façon planche d'atlas (« Fig. »).
 */
export function AtlasPhoto({
  photo,
  sizes,
  className = "",
  priority = false,
  caption = false,
  figureNumber,
  reveal = true,
  delay = 0,
  focus,
  zoom = 1,
  aspect,
}: AtlasPhotoProps) {
  const [fx, fy] = focus ?? photo.focus;
  const img = (
    <div className="relative h-full w-full overflow-hidden bg-stone" style={aspect ? { aspectRatio: aspect } : undefined}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        className="object-cover"
        style={{ objectPosition: `${fx}% ${fy}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: `${fx}% ${fy}%` }}
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
      {caption ? (
        <figcaption className="caption-mono mt-3 flex gap-3 text-ink-soft">
          {figureNumber ? <span className="text-bronze-ink">Fig. {figureNumber}</span> : null}
          <span className="normal-case tracking-normal">{captionText}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
