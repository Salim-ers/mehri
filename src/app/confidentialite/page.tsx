import { PlateHeader } from "@/components/shared/PlateHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et gestion des cookies du site du cabinet d'ostéopathie de Creil.",
  path: "/confidentialite",
});

export default function ConfidentialitePage() {
  return (
    <>
      <PlateHeader plate="—" latin="Secretum" title="Confidentialité" />
      <div className="px-[var(--gutter)] pb-24">
        <div className="prose-atlas mx-auto max-w-3xl space-y-10">
          <section aria-labelledby="donnees">
            <h2 id="donnees" className="display text-3xl text-umber">
              Données collectées
            </h2>
            <p className="mt-5">
              Ce site ne comporte aucun formulaire, aucun compte utilisateur et aucun outil de mesure d&apos;audience. Il ne collecte aucune donnée
              de santé. La prise de rendez-vous s&apos;effectue par téléphone, directement auprès du cabinet.
            </p>
            <p>
              Comme tout site web, l&apos;hébergeur enregistre des journaux techniques (adresse IP, date, page demandée) nécessaires à la sécurité et
              au bon fonctionnement du service, pour une durée limitée.
            </p>
          </section>
          <section aria-labelledby="cookies">
            <h2 id="cookies" className="display text-3xl text-umber">
              Cookies et services tiers
            </h2>
            <p className="mt-5">
              Aucun cookie n&apos;est déposé à l&apos;arrivée sur le site. Le plan Google Maps de la page « Contact » n&apos;est chargé que si vous
              cliquez sur « Afficher le plan » : Google peut alors déposer ses propres cookies, selon sa politique de confidentialité. Les liens
              d&apos;itinéraire ouvrent les services choisis (Google Maps, Plans d&apos;Apple, Waze) dans un nouvel onglet.
            </p>
            <p>
              Le site utilise le stockage de session de votre navigateur pour ne pas rejouer l&apos;animation d&apos;ouverture : cette information
              technique ne vous identifie pas et disparaît à la fermeture de l&apos;onglet.
            </p>
          </section>
          <section aria-labelledby="droits">
            <h2 id="droits" className="display text-3xl text-umber">
              Vos droits
            </h2>
            <p className="mt-5">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez de droits d&apos;accès, de rectification, d&apos;effacement et
              d&apos;opposition. Pour les exercer, contactez le cabinet. Vous pouvez également introduire une réclamation auprès de la CNIL
              (www.cnil.fr).
            </p>
          </section>
          <p className="text-sm">Dernière mise à jour : 6 novembre 2026.</p>
        </div>
      </div>
    </>
  );
}
