import Link from "next/link";
import { SpineDrawing } from "@/components/shared/SpineDrawing";

export default function NotFound() {
  return (
    <section className="flex min-h-[86svh] items-center px-[var(--gutter)] pt-[var(--header-h)]">
      <div className="wrap grid items-center gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow">Erreur 404</p>
          <h1 className="display mt-6 text-[clamp(2.8rem,1.5rem+4.8vw,6.8rem)]">
            Cette page a <em>quitté l&apos;axe.</em>
          </h1>
          <p className="prose-body mt-6 max-w-lg">La page demandée n&apos;existe pas ou a été déplacée.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/" className="btn btn-primary">
              Retour à l&apos;accueil
            </Link>
            <Link href="/rendez-vous" data-booking className="link-more text-ink">
              Prendre rendez-vous
            </Link>
          </div>
        </div>
        <div className="hidden justify-center md:col-span-4 md:col-start-9 md:flex">
          <SpineDrawing variant="solid" className="h-[62vh] w-auto rotate-[8deg] text-mineral-deep" />
        </div>
      </div>
    </section>
  );
}
