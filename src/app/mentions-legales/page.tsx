import { MissingSlot, PendingBadge } from "@/components/shared/Pending";
import { PlateHeader } from "@/components/shared/PlateHeader";
import { identity, practice } from "@/content/practice";
import { formatAddress } from "@/lib/contact-links";
import { hasValue, type Fact } from "@/lib/facts";
import { breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales du site du cabinet d'ostéopathie de ${identity.name} à ${identity.city}.`,
  path: "/mentions-legales",
});

function Line({ label, fact }: { label: string; fact: Fact<string> }) {
  return (
    <div className="grid gap-2 border-b border-umber/12 py-4 sm:grid-cols-[14rem_1fr]">
      <dt className="caption-mono text-ink-soft">{label}</dt>
      <dd>{hasValue(fact) ? <>{fact.value} <PendingBadge fact={fact} /></> : <MissingSlot fact={fact}><span className="text-ink-soft">—</span></MissingSlot>}</dd>
    </div>
  );
}

export default function MentionsLegalesPage() {
  const address = hasValue(practice.address) ? formatAddress(practice.address.value) : null;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Mentions légales", path: "/mentions-legales" }])) }}
      />
      <PlateHeader plate="—" latin="Notitia legalis" title="Mentions légales" />
      <div className="px-[var(--gutter)] pb-24">
        <div className="mx-auto max-w-4xl space-y-14">
          <section aria-labelledby="editeur">
            <h2 id="editeur" className="display text-3xl text-umber">
              Éditeur du site
            </h2>
            <dl className="mt-6 border-t border-umber/12">
              <Line label="Éditeur" fact={practice.legal.publisher} />
              <Line label="Praticien" fact={practice.practitionerName} />
              <Line label="Profession" fact={practice.title} />
              {address ? (
                <div className="grid gap-2 border-b border-umber/12 py-4 sm:grid-cols-[14rem_1fr]">
                  <dt className="caption-mono text-ink-soft">Adresse</dt>
                  <dd>
                    {address} <PendingBadge fact={practice.address} />
                  </dd>
                </div>
              ) : null}
              {hasValue(practice.phone) ? (
                <div className="grid gap-2 border-b border-umber/12 py-4 sm:grid-cols-[14rem_1fr]">
                  <dt className="caption-mono text-ink-soft">Téléphone</dt>
                  <dd>{practice.phone.value.display}</dd>
                </div>
              ) : null}
              <Line label="SIRET" fact={practice.legal.siret} />
              <Line label="N° ADELI / RPPS" fact={practice.legal.adeli} />
              <Line label="Assurance RC professionnelle" fact={practice.legal.insurer} />
            </dl>
          </section>
          <section aria-labelledby="hebergeur">
            <h2 id="hebergeur" className="display text-3xl text-umber">
              Hébergement
            </h2>
            <dl className="mt-6 border-t border-umber/12">
              <Line label="Hébergeur" fact={practice.legal.host} />
            </dl>
          </section>
          <section aria-labelledby="contenus" className="prose-atlas">
            <h2 id="contenus" className="display text-3xl text-umber">
              Contenus et propriété intellectuelle
            </h2>
            <p className="mt-6">
              Les textes, photographies, illustrations et modèles 3D de ce site sont protégés. Les modèles anatomiques 3D sont des créations
              originales réalisées pour ce site ; ils ont une vocation pédagogique et ne constituent pas une représentation médicale exacte.
            </p>
            <p>
              Les informations publiées sont générales et ne remplacent ni une consultation ni un avis médical. L&apos;ostéopathie ne se substitue
              pas à un traitement médical.
            </p>
            <p>Conception et développement : QuadCore.</p>
          </section>
        </div>
      </div>
    </>
  );
}
