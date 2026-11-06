import { Reveal } from "@/components/shared/Reveal";
import type { ConsultationStep } from "@/content/site";

/**
 * Les quatre temps d'une consultation : grands titres, texte posé, une ligne
 * verticale discrète qui relie les étapes (aucune numérotation, aucune photo de personne).
 */
export function ConsultationTimeline({ steps }: { steps: readonly ConsultationStep[] }) {
  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute bottom-6 left-[0.3rem] top-6 w-px bg-gradient-to-b from-bronze/0 via-bronze/45 to-bronze/0 md:left-[0.4rem]" />
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid gap-y-4 pb-16 pl-10 last:pb-0 md:grid-cols-12 md:gap-x-8 md:pb-24 md:pl-14">
          <span aria-hidden="true" className="absolute left-0 top-[0.9rem] block h-[0.65rem] w-[0.65rem] rounded-full border border-bronze bg-ivory md:h-[0.8rem] md:w-[0.8rem]" />
          <Reveal className="md:col-span-5" delay={60}>
            <h2 className="display text-[clamp(2.2rem,1.5rem+2.6vw,4.2rem)]">{step.title}</h2>
            <p className="lede mt-4 text-ink-soft">{step.summary}</p>
          </Reveal>
          <Reveal className="prose-body md:col-span-6 md:col-start-7 md:pt-3" delay={120 + i * 10}>
            {step.detail.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
