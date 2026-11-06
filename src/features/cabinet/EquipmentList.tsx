import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { Photo } from "@/components/shared/Photo";
import { Reveal } from "@/components/shared/Reveal";
import type { Equipment } from "@/content/equipment";
import { reviewMode } from "@/content/practice";
import { hasValue, isNotPublished, type Fact } from "@/lib/facts";

function FactRow({ label, fact }: { label: string; fact: Fact<string> }) {
  if (!hasValue(fact)) {
    if (!reviewMode || isNotPublished(fact)) return null;
    return (
      <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
        <dt className="text-sm text-ink-soft">{label}</dt>
        <dd>
          <MissingSlot fact={fact} />
        </dd>
      </div>
    );
  }
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd>
        {fact.value} <PendingBadge fact={fact} />
      </dd>
    </div>
  );
}

/**
 * Matériel du cabinet : description factuelle, aucun effet attribué.
 * Seules des photographies sans personne sont utilisées (détail recadré).
 */
export function EquipmentList({ items, detailed = false }: { items: readonly Equipment[]; detailed?: boolean }) {
  return (
    <ul className="border-t border-ink/10">
      {items.map((item, i) => (
        <li key={item.id} className="border-b border-ink/10">
          <Reveal delay={(i % 3) * 60} className="grid items-center gap-x-8 gap-y-5 py-8 sm:grid-cols-[minmax(9rem,13rem)_1fr]">
            {item.photo ? (
              <Photo
                photo={item.photo}
                focus={item.focus}
                zoom={item.zoom}
                sizes="(min-width: 640px) 13rem, 60vw"
                aspect="4 / 3"
                reveal={false}
                className="w-full max-w-[13rem]"
              />
            ) : (
              <div aria-hidden="true" className="hidden sm:block" />
            )}
            <div>
              <h3 className="display text-[clamp(1.6rem,1.3rem+1vw,2.3rem)]">{hasValue(item.name) ? item.name.value : item.family}</h3>
              {hasValue(item.name) ? <p className="mt-1 text-sm text-ink-soft">{item.family}</p> : null}
              <p className="prose-body mt-3 max-w-2xl">{item.observed}</p>
              {detailed ? (
                <dl className="mt-3 max-w-2xl">
                  <FactRow label="Utilisation" fact={item.usage} />
                  <FactRow label="Rôle en séance" fact={item.role} />
                </dl>
              ) : hasValue(item.usage) ? (
                <p className="mt-2 text-[0.95rem] text-ink-soft">{item.usage.value}.</p>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
