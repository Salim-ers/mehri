import { redFlags } from "@/content/site";

/** Signes d'alerte : orientation médicale prioritaire. */
export function RedFlags({ extra = [], tone = "light" }: { extra?: readonly string[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <aside
      aria-labelledby="signes-alerte"
      className={`rounded-lg border p-6 md:p-8 ${dark ? "border-bone/15 bg-bone/5 text-bone" : "border-walnut/25 bg-paper text-ink"}`}
    >
      <p className={`caption-mono ${dark ? "text-bronze-light" : "text-bronze-ink"}`}>Prudence</p>
      <h2 id="signes-alerte" className="display mt-3 text-2xl md:text-3xl">
        Quand consulter d&apos;abord un médecin
      </h2>
      <p className={`mt-3 text-[0.95rem] ${dark ? "text-bone/75" : "text-ink-soft"}`}>
        L&apos;ostéopathe n&apos;établit pas de diagnostic médical. Consultez votre médecin — ou appelez le <a href="tel:15" className="link-atlas font-semibold">15</a> en cas
        d&apos;urgence — notamment en présence de :
      </p>
      <ul className="mt-5 grid gap-x-8 gap-y-2.5 text-[0.95rem] md:grid-cols-2">
        {[...extra, ...redFlags.filter((f) => !extra.includes(f))].map((f) => (
          <li key={f} className="flex gap-3">
            <span aria-hidden="true" className={`mt-[0.55em] block h-1.5 w-1.5 shrink-0 rotate-45 ${dark ? "bg-bronze-light" : "bg-walnut"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
