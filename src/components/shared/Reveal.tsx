"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "id"> {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly className?: string;
  /** « fade » : montée douce ; « mask » : ouverture photographique */
  readonly variant?: "fade" | "mask";
  readonly delay?: number;
  readonly id?: string;
}

/**
 * Révélation progressive au défilement. Le contenu est présent dans le HTML
 * (indexable, visible sans JavaScript) ; seule sa présentation est animée.
 */
export function Reveal({ as: Tag = "div", children, className = "", variant = "fade", delay = 0, id, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const style = { "--delay": `${delay}ms` } as CSSProperties;
  return (
    <Tag {...rest} ref={ref} id={id} className={`${variant === "mask" ? "reveal-mask" : "reveal"} ${className}`} style={style}>
      {/* le masque est porté par un enfant : un élément entièrement « clippé »
          n'est jamais signalé comme visible par IntersectionObserver */}
      {variant === "mask" ? <div className="reveal-mask__inner">{children}</div> : children}
    </Tag>
  );
}
