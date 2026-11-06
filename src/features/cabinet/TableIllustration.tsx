/**
 * Illustration mécanique (SVG + CSS) : segments d'une table de soins réglable.
 * Elle montre uniquement le réglage du matériel, sans suggérer d'effet thérapeutique.
 */
export function TableIllustration({ variant }: { variant: "table-articulation" | "segments" }) {
  const segments = variant === "segments" ? 4 : 3;
  return (
    <svg viewBox="0 0 320 120" className="h-auto w-full max-w-xs text-umber" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="20" y1="108" x2="300" y2="108" opacity="0.3" />
      <path d="M90 104 L110 70 M230 104 L210 70 M110 70 H210" opacity="0.6" />
      {Array.from({ length: segments }, (_, i) => {
        const w = 240 / segments;
        const x = 40 + i * w;
        return (
          <g key={i} className="table-segment" style={{ ["--i" as string]: i, transformOrigin: `${x + (i < segments / 2 ? w : 0)}px 62px` }}>
            <rect x={x + 2} y="52" width={w - 4} height="12" rx="3" fill="var(--color-walnut)" fillOpacity="0.85" stroke="none" />
          </g>
        );
      })}
      <text x="20" y="20" className="caption-mono" fill="currentColor" stroke="none" fontSize="9">
        Réglage des segments
      </text>
    </svg>
  );
}
