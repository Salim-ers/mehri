import type { RegionId } from "@/content/anatomy";

/** Repères (x, y) des régions sur la silhouette 2D (viewBox 200 × 440). */
const HOTSPOTS: Record<RegionId, readonly [number, number]> = {
  cervicales: [100, 58],
  epaules: [138, 84],
  thorax: [100, 112],
  colonne: [100, 168],
  bassin: [100, 210],
  hanches: [126, 226],
  genoux: [118, 318],
};

interface BodyMapProps {
  readonly selected: RegionId | null;
  readonly onSelect: (id: RegionId) => void;
  readonly labels: Record<RegionId, string>;
}

/**
 * Silhouette anatomique vectorielle : alternative sans WebGL de l'atlas 3D.
 * Chaque repère est un vrai bouton (clavier, lecteurs d'écran).
 */
export function BodyMap({ selected, onSelect, labels }: BodyMapProps) {
  return (
    <div className="relative mx-auto aspect-[200/440] h-full max-h-[78svh] text-bone">
      <svg viewBox="0 0 200 440" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <g opacity="0.55">
          <ellipse cx="100" cy="30" rx="17" ry="21" />
          <path d="M100 52 V200" strokeDasharray="3 3" />
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M100 ${84 + i * 8} q ${-26 + Math.abs(i - 4) * 1.4} ${4} ${-30 + Math.abs(i - 4) * 2.2} ${14} M100 ${84 + i * 8} q ${26 - Math.abs(i - 4) * 1.4} ${4} ${30 - Math.abs(i - 4) * 2.2} ${14}`} />
          ))}
          <path d="M66 74 L134 74 M66 74 L60 80 M134 74 L140 80" />
          <path d="M60 80 L52 150 L48 214 M140 80 L148 150 L152 214" />
          <path d="M72 198 q 28 -16 56 0 q 6 18 -10 30 q -18 8 -36 0 q -16 -12 -10 -30 Z" />
          <path d="M84 226 L82 316 L84 410 M116 226 L118 316 L116 410" />
          <path d="M84 410 l -10 10 M116 410 l 10 10" />
        </g>
      </svg>
      {(Object.keys(HOTSPOTS) as RegionId[]).map((id) => {
        const [x, y] = HOTSPOTS[id];
        const on = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={on}
            aria-label={labels[id]}
            className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
            style={{ left: `${(x / 200) * 100}%`, top: `${(y / 440) * 100}%` }}
          >
            <span className={`block h-4 w-4 rounded-full border-2 transition-all duration-300 ${on ? "scale-125 border-bronze-light bg-bronze" : "border-bone/70 bg-umber group-hover:border-bronze-light"}`} />
          </button>
        );
      })}
    </div>
  );
}
