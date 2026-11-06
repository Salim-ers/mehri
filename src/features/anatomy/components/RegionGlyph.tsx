import type { RegionId } from "@/content/anatomy";

/** Zones (en coordonnées viewBox 100 × 220) mises en évidence par région. */
const ZONES: Record<RegionId, { cx: number; cy: number; rx: number; ry: number }> = {
  cervicales: { cx: 50, cy: 30, rx: 9, ry: 9 },
  epaules: { cx: 50, cy: 41, rx: 30, ry: 8 },
  thorax: { cx: 50, cy: 58, rx: 17, ry: 15 },
  colonne: { cx: 50, cy: 72, rx: 6, ry: 36 },
  bassin: { cx: 50, cy: 103, rx: 16, ry: 9 },
  hanches: { cx: 50, cy: 112, rx: 22, ry: 8 },
  genoux: { cx: 50, cy: 160, rx: 18, ry: 10 },
};

/** Mini-silhouette d'atlas (rendu serveur, sans JavaScript). */
export function RegionGlyph({ region, className = "" }: { region: RegionId; className?: string }) {
  const z = ZONES[region];
  return (
    <svg viewBox="0 0 100 220" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} fill="var(--color-bronze-light)" fillOpacity="0.25" stroke="var(--color-bronze-light)" strokeWidth="0.8" />
      <g opacity="0.7">
        <ellipse cx="50" cy="14" rx="8.5" ry="10.5" />
        <path d="M50 25 V102" strokeDasharray="2 2" />
        <path d="M33 37 H67 M33 37 L29 42 M67 37 L71 42" />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M50 ${44 + i * 5} q -14 2 -16 8 M50 ${44 + i * 5} q 14 2 16 8`} />
        ))}
        <path d="M29 42 L25 78 L23 108 M71 42 L75 78 L77 108" />
        <path d="M36 98 q 14 -8 28 0 q 3 9 -5 15 q -9 4 -18 0 q -8 -6 -5 -15 Z" />
        <path d="M42 112 L41 158 L42 206 M58 112 L59 158 L58 206" />
        <path d="M42 206 l -5 5 M58 206 l 5 5" />
      </g>
    </svg>
  );
}
