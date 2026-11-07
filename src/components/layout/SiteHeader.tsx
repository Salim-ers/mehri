"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowIcon, CloseIcon, PhoneIcon } from "@/components/shared/Icons";
import { navigation, secondaryPages, type NavItem } from "@/content/site";

interface SiteHeaderProps {
  readonly name: string;
  readonly title: string;
  readonly city: string;
  readonly phoneDisplay: string | null;
  readonly phoneHref: string | null;
  readonly addressLine: string | null;
  readonly hours: readonly { readonly days: string; readonly hours: string }[];
}

/** Pages sur fond sombre : la capsule passe en bleu nuit. */
const DARK_ROUTES = ["/anatomie"];

const types = (item: NavItem) => (item.transition ? [item.transition] : undefined);

/**
 * En-tête flottant en capsule : logo, navigation centrale (≥ 1280 px), « Prendre RDV »
 * toujours visible, menu plein écran (<dialog> natif : focus piégé, Échap, retour du focus).
 * La capsule se resserre au défilement par une animation CSS pilotée par le défilement.
 */
export function SiteHeader({ name, title, city, phoneDisplay, phoneHref, addressLine, hours }: SiteHeaderProps) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(0);

  // ferme le menu à chaque navigation
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const toggle = () => {
    const d = dialog.current;
    if (!d) return;
    if (d.open) d.close();
    else {
      setPreview(Math.max(0, navigation.findIndex((n) => isActive(n.href))));
      d.showModal();
      // état tenu ici : l'évènement « toggle » du <dialog> n'existe pas dans tous les navigateurs
      setOpen(true);
    }
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const dark = DARK_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-3 z-[120] rounded-full bg-graphite px-5 py-3 text-paper">
        Aller au contenu
      </a>
      <header className="site-header" data-tone={dark ? "dark" : "light"} style={{ viewTransitionName: "site-header" }}>
        <div className="site-header__bar">
          <Link href="/" className="flex min-w-0 items-center gap-3 rounded-full pr-2">
            <Image
              src={dark ? "/images/monogramme-clair.png" : "/images/monogramme.png"}
              alt=""
              width={46}
              height={45}
              className="h-9 w-auto shrink-0 sm:h-10"
              priority
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-[1.06rem] tracking-[-0.01em] sm:text-[1.16rem]">{name}</span>
              <span className={`mt-1 truncate text-[0.7rem] font-medium tracking-[0.04em] ${dark ? "text-mist" : "text-ink-soft"}`}>
                {title} · {city}
              </span>
              <span className="sr-only"> — retour à l&apos;accueil</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="mx-auto hidden xl:block">
            <ul className="flex items-center gap-0.5 whitespace-nowrap">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} transitionTypes={types(item)} aria-current={isActive(item.href) ? "page" : undefined} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:ml-0">
            <Link href="/rendez-vous" data-booking className={`btn btn-sm ${dark ? "btn-xray" : "btn-primary"}`}>
              <span className="hidden sm:inline">Prendre RDV</span>
              <span className="sm:hidden">RDV</span>
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              className={`group flex min-h-11 items-center gap-2.5 rounded-full px-3.5 text-[0.9rem] font-semibold transition-colors ${dark ? "hover:bg-bone/10" : "hover:bg-ink/5"}`}
            >
              <span className="flex flex-col gap-[4px]" aria-hidden="true">
                <span className="block h-[1.5px] w-[18px] rounded-full bg-current" />
                <span className="block h-[1.5px] w-[18px] rounded-full bg-current transition-[width] duration-500 group-hover:w-3" />
              </span>
              <span className="max-sm:sr-only">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialog}
        id="site-menu"
        aria-label="Menu du site"
        onClose={() => setOpen(false)}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDialogElement).open)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        className="site-menu"
      >
        <div className="site-menu__panel on-dark">
          <div className="flex min-h-full flex-col px-[var(--gutter)] pb-8 pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-3">
                <Image src="/images/monogramme-clair.png" alt="" width={46} height={45} className="h-10 w-auto" />
                <span className="font-display text-lg">{name}</span>
              </p>
              <button type="button" onClick={() => dialog.current?.close()} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-bone/10">
                <CloseIcon /> Fermer
              </button>
            </div>

            <div className="mt-8 grid flex-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
              <nav aria-label="Toutes les pages">
                <ul>
                  {navigation.map((item, i) => (
                    <li key={item.href} className="menu-item border-b border-bone/10" style={{ "--i": i } as CSSProperties}>
                      <Link
                        href={item.href}
                        transitionTypes={types(item)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className="menu-link"
                        onMouseEnter={() => setPreview(i)}
                        onFocus={() => setPreview(i)}
                      >
                        {item.label}
                        <span className="ml-auto self-center font-sans text-sm font-medium tracking-normal text-mist max-sm:hidden">{item.hint}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {secondaryPages.map((item, i) => (
                    <li key={item.href} className="menu-item" style={{ "--i": navigation.length + i } as CSSProperties}>
                      <Link href={item.href} data-booking={item.href === "/rendez-vous" ? true : undefined} className="chip">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-5">
                {/* vignette : photographie du cabinet ou cliché pédagogique, selon la rubrique survolée */}
                <div className="menu-visual relative hidden aspect-[4/3] overflow-hidden rounded-card bg-night lg:block">
                  {open
                    ? navigation.map((item, i) =>
                        item.visual ? (
                          <Image
                            key={item.href}
                            src={item.visual.src}
                            alt=""
                            fill
                            sizes="40vw"
                            quality={70}
                            loading="eager"
                            data-active={i === preview}
                            className={`object-cover ${item.visual.tone === "xray" ? "object-center" : "object-[50%_62%]"}`}
                          />
                        ) : null,
                      )
                    : null}
                </div>
                <div className="menu-item card-dark rounded-card p-6" style={{ "--i": 8 } as CSSProperties}>
                  <p className="eyebrow">Rendez-vous</p>
                  {phoneHref && phoneDisplay ? (
                    <a href={phoneHref} className="mt-3 flex items-center gap-3 font-display text-3xl text-bone hover:text-bronze-light">
                      <PhoneIcon className="h-5 w-5" /> {phoneDisplay}
                    </a>
                  ) : null}
                  {hours.length ? (
                    <ul className="mt-4 space-y-1 text-sm text-mist">
                      {hours.map((h) => (
                        <li key={h.days}>
                          {h.days} : {h.hours}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {addressLine ? <p className="mt-3 text-sm text-mist">{addressLine}</p> : null}
                  <Link href="/rendez-vous" data-booking className="btn btn-light btn-sm mt-5">
                    Prendre rendez-vous <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
