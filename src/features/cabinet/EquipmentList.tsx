import Image from "next/image";
import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Reveal } from "@/components/shared/Reveal";
import type { Equipment } from "@/content/equipment";
import { reviewMode } from "@/content/practice";
import { hasValue, isNotPublished, type Fact } from "@/lib/facts";

function FactRow({ label, fact, dark = false }: { label: string; fact: Fact<string>; dark?: boolean }) {
  if (!hasValue(fact)) {
    if (!reviewMode || isNotPublished(fact)) return null;
    return (
      <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
        <dt className={`text-sm ${dark ? "text-mist" : "text-ink-soft"}`}>{label}</dt>
        <dd>
          <MissingSlot fact={fact} />
        </dd>
      </div>
    );
  }
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
      <dt className={`text-sm ${dark ? "text-mist" : "text-ink-soft"}`}>{label}</dt>
      <dd>
        {fact.value} <PendingBadge fact={fact} />
      </dd>
    </div>
  );
}

const title = (item: Equipment) => (hasValue(item.name) ? item.name.value : item.family);

/** Détail recadré dans une photographie réelle du cabinet (jamais déformé). */
function Crop({ item, sizes, className = "", parallax = false, maxZoom = Infinity }: { item: Equipment; sizes: string; className?: string; parallax?: boolean; maxZoom?: number }) {
  if (!item.photo) return null;
  const [fx, fy] = item.focus;
  // grand format : zoom plafonné pour ne jamais agrandir la photo source au-delà de sa résolution
  const zoom = Math.min(item.zoom, maxZoom);
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image
        src={item.photo.src}
        alt={`${title(item)} : détail d'une photographie du cabinet. ${item.observed}`}
        fill
        sizes={sizes}
        quality={80}
        className={`object-cover ${parallax ? "parallax-img" : ""}`}
        style={{ objectPosition: `${fx}% ${fy}%`, scale: String(zoom), transformOrigin: `${fx}% ${fy}%` }}
      />
    </div>
  );
}

/** Version courte (page « Cabinet ») : cartes compactes, description factuelle. */
export function EquipmentList({ items }: { items: readonly Equipment[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal as="li" key={item.id} delay={(i % 2) * 70} className="card flex gap-4 p-4">
          {item.photo ? <Crop item={item} sizes="7rem" className="h-24 w-24 shrink-0 rounded-soft" /> : <span aria-hidden="true" className="h-24 w-2 shrink-0 rounded-full bg-sand" />}
          <div className="min-w-0 self-center">
            <h3 className="font-display text-[1.35rem] leading-tight">{title(item)}</h3>
            <p className="mt-1 line-clamp-3 text-[0.9rem] text-ink-soft">{item.observed}</p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * Présentation détaillée (page « Équipements ») : une composition par appareil,
 * à la manière d'un lancement de produit, mais strictement factuelle —
 * aucun effet thérapeutique attribué, aucune image d'appareil inventée.
 */
export function EquipmentShowcase({ items }: { items: readonly Equipment[] }) {
  const withPhoto = items.filter((i) => i.photo);
  const withoutPhoto = items.filter((i) => !i.photo);
  return (
    <div className="space-y-5">
      {withPhoto.map((item, i) => {
        const hero = i === 0;
        const flip = i % 2 === 1;
        return (
          <Reveal key={item.id} className={`overflow-hidden rounded-panel ${hero ? "bg-graphite text-bone" : "bg-paper"} ${hero ? "" : "panel"}`}>
            <article aria-labelledby={`eq-${item.id}`} className={`grid ${hero ? "lg:grid-cols-[1.35fr_1fr]" : "lg:grid-cols-2"}`}>
              <Crop item={item} maxZoom={1.3} sizes={hero ? "(min-width: 1024px) 56vw, 100vw" : "(min-width: 1024px) 46vw, 100vw"} parallax className={`${hero ? "min-h-[26rem] lg:min-h-[40rem]" : "min-h-[22rem] lg:min-h-[32rem]"} ${flip ? "lg:order-2" : ""} m-2 rounded-card`} />
              <div className={`flex flex-col justify-center p-8 md:p-12 ${hero ? "on-dark" : ""}`}>
                <p className="eyebrow">{item.family}</p>
                <h2 id={`eq-${item.id}`} className="display mt-4 text-[clamp(2.2rem,1.5rem+2.6vw,4.2rem)]">
                  {title(item)}
                </h2>
                <p className={`lede mt-5 ${hero ? "" : "text-ink-soft"}`}>{item.observed}</p>
                <dl className={`mt-6 divide-y ${hero ? "divide-bone/15" : "divide-clay"}`}>
                  <FactRow label="Utilisation" fact={item.usage} dark={hero} />
                  <FactRow label="Rôle en séance" fact={item.role} dark={hero} />
                </dl>
              </div>
            </article>
          </Reveal>
        );
      })}
      {withoutPhoto.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {withoutPhoto.map((item, i) => (
            <Reveal key={item.id} delay={i * 90} className="panel-sand p-8 md:p-10">
              <article aria-labelledby={`eq-${item.id}`}>
                <p className="eyebrow">Matériel présent au cabinet</p>
                <h2 id={`eq-${item.id}`} className="display mt-4 text-[clamp(1.9rem,1.4rem+1.6vw,2.8rem)]">
                  {title(item)}
                </h2>
                <p className="prose-body mt-4">{item.observed}</p>
                <dl className="mt-4 divide-y divide-clay">
                  <FactRow label="Utilisation" fact={item.usage} />
                  <FactRow label="Rôle en séance" fact={item.role} />
                </dl>
                <p className="mt-5 text-sm text-ink-soft">Aucune photographie de cet appareil n&apos;est publiée.</p>
              </article>
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
