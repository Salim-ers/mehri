"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/shared/Icons";
import { navigation, secondaryPages } from "@/content/site";

interface SiteHeaderProps {
  readonly name: string;
  readonly title: string;
  readonly city: string;
  readonly phoneDisplay: string | null;
  readonly phoneHref: string | null;
  readonly addressLine: string | null;
}

/**
 * En-tête : monogramme et nom, navigation principale (≥ 1280 px), bouton de
 * rendez-vous toujours visible, menu plein écran (<dialog> natif : piège de
 * focus, Échap, retour du focus) en dessous.
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
  const links = navigation.filter((n) => n.href !== "/rendez-vous");

  return (
    <>
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-3 z-[120] rounded bg-anthracite px-4 py-2 text-paper">
        Aller au contenu
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled ? "bg-ivory/85 shadow-[0_1px_0_rgba(27,29,31,0.07)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[120rem] items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <Image src="/images/monogramme.png" alt="" width={44} height={43} className="h-9 w-auto shrink-0 lg:h-10" priority />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-[1.08rem] tracking-[-0.01em] text-ink sm:text-[1.2rem]">{name}</span>
              <span className="mt-1 truncate text-[0.7rem] font-medium tracking-[0.06em] text-ink-soft">
                {title} · {city}
              </span>
              <span className="sr-only"> — retour à l&apos;accueil</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className="flex items-center gap-8 whitespace-nowrap">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative py-2 text-[0.92rem] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"
                  >
                    {item.short ?? item.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/rendez-vous" data-booking className="btn btn-primary hidden min-h-11 py-2.5 text-[0.88rem] sm:inline-flex">
              Prendre RDV
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              className="group flex min-h-11 items-center gap-3 rounded-full border border-ink/15 px-4 text-[0.88rem] text-ink transition-colors hover:border-ink/50 xl:hidden"
            >
              <span className="flex flex-col gap-[4px]" aria-hidden="true">
                <span className="block h-[1.5px] w-4 rounded-full bg-current" />
                <span className="block h-[1.5px] w-4 rounded-full bg-current transition-all duration-500 group-hover:w-2.5" />
              </span>
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialog}
        id="site-menu"
        aria-label="Menu du site"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDialogElement).open)}
        className="site-menu on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-anthracite p-0 text-bone backdrop:bg-anthracite/60"
      >
        <div className="flex h-full flex-col overflow-y-auto px-[var(--gutter)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <span className="font-display text-lg">{name}</span>
            <button type="button" onClick={toggle} className="flex min-h-11 items-center gap-2 rounded-full border border-bone/20 px-4 text-[0.88rem] hover:border-bone">
              <CloseIcon /> Fermer
            </button>
          </div>
          <div className="mx-auto grid w-full max-w-[110rem] flex-1 grid-cols-12 gap-6 py-6 md:py-12">
            <nav aria-label="Toutes les pages" className="col-span-12 lg:col-span-8">
              <ul className="site-menu__list">
                {navigation.map((item, i) => (
                  <li key={item.href} style={{ ["--i" as string]: i }}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => dialog.current?.close()}
                      className="group flex items-baseline justify-between gap-4 border-b border-bone/10 py-3.5 md:py-4"
                    >
                      <span className="display text-[clamp(2rem,1.3rem+2.8vw,3.6rem)] transition-colors duration-500 group-hover:text-bronze-light group-aria-[current=page]:text-bronze-light">
                        {item.label}
                      </span>
                      <span className="hidden text-sm text-bone/60 sm:block">{item.hint}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem] text-bone/70">
                {secondaryPages.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => dialog.current?.close()} className="hover:text-bone">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <aside className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-4 lg:pl-10">
              {addressLine ? <p className="text-bone/80">{addressLine}</p> : null}
              {phoneHref && phoneDisplay ? (
                <a href={phoneHref} className="display text-4xl text-bone hover:text-bronze-light">
                  {phoneDisplay}
                </a>
              ) : null}
              <Link href="/rendez-vous" data-booking onClick={() => dialog.current?.close()} className="btn btn-light self-start">
                Prendre rendez-vous <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </div>
      </dialog>
    </>
  );
}
