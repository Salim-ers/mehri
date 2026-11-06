"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // journalisation minimale côté client (aucune donnée personnelle)
    console.error("Erreur d'affichage", error.digest ?? error.message);
  }, [error]);
  return (
    <section className="flex min-h-[70svh] items-center px-[var(--gutter)] pt-[var(--header-h)]">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Incident d&apos;affichage</p>
        <h1 className="display mt-6 text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">Un élément n&apos;a pas pu s&apos;afficher.</h1>
        <p className="prose-body mt-6">Vous pouvez réessayer ; les informations essentielles restent accessibles depuis la page contact.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">
            Réessayer
          </button>
          <Link href="/contact" className="btn btn-ghost">
            Contact et rendez-vous
          </Link>
        </div>
      </div>
    </section>
  );
}
