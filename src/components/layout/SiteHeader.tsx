"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/site";

interface SiteHeaderProps {
  readonly name: string;
  readonly title: string;
  readonly city: string;
  readonly phoneDisplay: string | null;
  readonly phoneHref: string | null;
  readonly addressLine: string | null;
}

/**
 * En-tête : monogramme + nom, liens principaux (≥ 1280 px), accès direct au
 * rendez-vous et « Index de l'atlas » (menu plein écran, <dialog> natif :
 * piège de focus, Échap, retour du focus).
 */
export function SiteHeader({ name, title, city, phoneDisplay, phoneHref, addressLine }: SiteHeaderProps) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ferme le menu à chaque navigation
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const toggle = () => {
    const d = dialog.current;
    if (!d) return;
    if (d.open) d.close();
    else d.showModal();
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const primary = navigation.filter((n) => n.primary);

  return (
    <>
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-3 z-[120] rounded bg-umber px-4 py-2 text-paper">
        Aller au contenu
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled ? "bg-ivory/86 shadow-[0_1px_0_rgba(36,26,21,0.08)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[120rem] items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href="/" className="group flex items-center gap-3">
            <Image src="/images/monogramme.png" alt="" width={44} height={43} className="h-10 w-auto transition-transform duration-700 group-hover:rotate-[-6deg]" priority />
            <span className="flex flex-col whitespace-nowrap leading-none">
              <span className="font-display text-[1.05rem] tracking-[-0.01em] text-umber sm:text-[1.15rem]">{name}</span>
              <span className="caption-mono mt-1 text-[0.6rem] text-ink-soft">
                {title} · {city}
              </span>
              <span className="sr-only"> — retour à l&apos;accueil</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className="flex items-center gap-7 whitespace-nowrap">
              {primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative py-2 text-[0.9rem] text-ink transition-colors hover:text-bronze-ink aria-[current=page]:text-bronze-ink"
                  >
                    <span className="caption-mono mr-1.5 text-[0.6rem] text-bronze-ink" aria-hidden="true">{item.plate}</span>
                    {item.short ?? item.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/rendez-vous" className="btn btn-primary hidden min-h-11 whitespace-nowrap py-2.5 text-[0.85rem] sm:inline-flex">
              Prendre rendez-vous
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="atlas-index"
              className="group flex min-h-11 items-center gap-3 rounded-full border border-umber/20 px-4 py-2 text-[0.85rem] text-umber transition-colors hover:border-umber"
            >
              <span className="flex flex-col items-center gap-[3px]" aria-hidden="true">
                {[10, 14, 18, 14].map((w, i) => (
                  <span key={i} className="block h-[2.5px] rounded-full bg-current transition-all duration-500 group-hover:w-[14px]" style={{ width: w }} />
                ))}
              </span>
              <span>Index</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialog}
        id="atlas-index"
        aria-label="Index du site"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDialogElement).open)}
        className="atlas-menu on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-umber p-0 text-bone backdrop:bg-umber/60"
      >
        <div className="grain flex h-full flex-col overflow-y-auto px-[var(--gutter)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <p className="caption-mono text-bronze-light">Index de l&apos;atlas</p>
            <button type="button" onClick={toggle} className="flex min-h-11 items-center gap-3 rounded-full border border-bone/25 px-4 text-[0.85rem] hover:border-bone">
              <span aria-hidden="true" className="text-lg leading-none">×</span> Fermer
            </button>
          </div>
          <div className="mx-auto grid w-full max-w-[110rem] flex-1 grid-cols-12 gap-6 py-6 md:py-10">
            <nav aria-label="Toutes les pages" className="col-span-12 lg:col-span-8">
              <ol className="atlas-menu__list">
                {navigation.map((item, i) => (
                  <li key={item.href} style={{ ["--i" as string]: i }}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => dialog.current?.close()}
                      className="group grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 border-b border-bone/10 py-3 md:grid-cols-[4.5rem_1fr_auto] md:py-4"
                    >
                      <span className="caption-mono text-bronze-light">{item.plate}</span>
                      <span className="display text-[clamp(1.9rem,1.2rem+2.6vw,3.6rem)] transition-[letter-spacing,color] duration-500 group-hover:text-bronze-light group-aria-[current=page]:text-bronze-light">
                        {item.label}
                      </span>
                      <span className="caption-mono col-start-2 text-bone/60 md:col-start-3">{item.hint}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <aside className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-4 lg:pl-10">
              <Image src="/images/monogramme-clair.png" alt="" width={140} height={136} className="hidden w-28 opacity-90 lg:block" />
              {addressLine ? (
                <div>
                  <p className="caption-mono text-bronze-light">Cabinet</p>
                  <p className="mt-2 text-bone/85">{addressLine}</p>
                </div>
              ) : null}
              {phoneHref && phoneDisplay ? (
                <a href={phoneHref} className="display text-3xl text-bone hover:text-bronze-light">
                  {phoneDisplay}
                </a>
              ) : null}
              <Link href="/rendez-vous" onClick={() => dialog.current?.close()} className="btn btn-light self-start">
                Prendre rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </div>
      </dialog>
    </>
  );
}
