import { redFlags } from "@/content/site";

/** Signes d'alerte : orientation médicale prioritaire. */
export function RedFlags({ extra = [], tone = "light" }: { extra?: readonly string[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <aside aria-labelledby="signes-alerte" className={`rounded-2xl p-7 md:p-10 ${dark ? "bg-bone/[0.06] text-bone" : "bg-paper text-ink"}`}>
      <p className="eyebrow">Prudence</p>
      <h2 id="signes-alerte" className="display mt-4 text-[clamp(1.7rem,1.3rem+1.2vw,2.4rem)]">
        Quand consulter d&apos;abord un médecin
      </h2>
      <p className={`mt-4 text-[0.98rem] leading-relaxed ${dark ? "text-bone/75" : "text-ink-soft"}`}>
        L&apos;ostéopathe n&apos;établit pas de diagnostic médical. Consultez votre médecin — ou appelez le{" "}
        <a href="tel:15" className="link-line font-semibold">
          15
        </a>{" "}
        en cas d&apos;urgence — notamment en présence de :
      </p>
      <ul className="mt-6 grid gap-x-10 gap-y-3 text-[0.97rem] md:grid-cols-2">
        {[...extra, ...redFlags.filter((f) => !extra.includes(f))].map((f) => (
          <li key={f} className="flex gap-3">
            <span aria-hidden="true" className={`mt-[0.6em] block h-1 w-3 shrink-0 rounded-full ${dark ? "bg-bronze-light" : "bg-bronze"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
