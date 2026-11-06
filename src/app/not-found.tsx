import Link from "next/link";
import { SpineDrawing } from "@/components/shared/SpineDrawing";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center px-[var(--gutter)] pt-[var(--header-h)]">
      <div className="mx-auto grid w-full max-w-[110rem] grid-cols-12 items-center gap-6">
        <div className="col-span-12 md:col-span-7">
          <p className="caption-mono text-bronze-ink">Erreur 404 · Planche introuvable</p>
          <h1 className="display mt-6 text-[clamp(2.6rem,1.4rem+4.6vw,6.4rem)] text-umber">
            Cette page a <em>quitté l&apos;axe.</em>
          </h1>
          <p className="prose-atlas mt-6 max-w-lg">La page demandée n&apos;existe pas ou a été déplacée.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
            <Link href="/rendez-vous" className="btn btn-ghost text-umber">Prendre rendez-vous</Link>
          </div>
        </div>
        <div className="col-span-12 hidden justify-center md:col-span-4 md:col-start-9 md:flex">
          <SpineDrawing className="h-[60vh] w-auto rotate-[8deg] text-stone-deep" />
        </div>
      </div>
    </section>
  );
}
