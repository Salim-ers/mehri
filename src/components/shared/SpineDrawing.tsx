import { computeFrames, SPINE_LENGTH_MM } from "@/features/anatomy/model/spine-profile";

/**
 * Dessin vectoriel de la colonne en vue latérale, calculé à partir du même
 * profil anatomique que le modèle 3D (source unique). Utilisé pour l'écran
 * d'ouverture, les transitions, le menu et la version sans WebGL.
 */
const frames = computeFrames();
const PAD = 20;
const H = SPINE_LENGTH_MM + 150;
const W = 220;
const CX = 96;

function toSvg(y: number, z: number) {
  // vue latérale : antérieur à gauche, crânial en haut
  return { x: CX - z, y: PAD + SPINE_LENGTH_MM - y };
}

export interface SpineDrawingProps {
  readonly className?: string;
  /** contours animés (écran d'ouverture) */
  readonly draw?: boolean;
  readonly variant?: "line" | "solid";
  readonly highlight?: readonly string[];
  readonly title?: string;
}

export function SpineDrawing({ className = "", draw = false, variant = "line", highlight = [], title }: SpineDrawingProps) {
  const pl = draw ? { pathLength: 1 } : {};
  const axis = frames
    .map((f, i) => {
      const p = toSvg(f.y, f.z);
      return `${i === 0 ? "M" : "L"}${(p.x + f.spec.depth * 0.5 + 10).toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");
  const sacrumTop = toSvg(0, 0);
  const n = frames.length;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={variant === "line" ? 1.1 : 0}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* canal / axe médullaire */}
      <path className="spine-axis" d={axis} strokeWidth={0.6} opacity={0.45} style={{ ["--i" as string]: 0 }} {...pl} />
      {[...frames].reverse().map((f, idx) => {
        const p = toSvg(f.y, f.z);
        const deg = (-f.tilt * 180) / Math.PI;
        const w = f.spec.depth;
        const h = f.spec.height;
        const on = highlight.includes(f.spec.label);
        const spinous = f.spec.region === "thoracic" ? 30 : f.spec.region === "lumbar" ? 26 : f.spec.label === "C7" ? 30 : 16;
        const drop = f.spec.region === "thoracic" ? 18 : 4;
        return (
          <g key={f.spec.label} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${deg.toFixed(2)})`} style={{ ["--i" as string]: idx + 1 }}>
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              rx={Math.min(4, h * 0.25)}
              {...pl}
              fill={variant === "solid" ? (on ? "var(--color-bronze)" : "currentColor") : "none"}
              fillOpacity={variant === "solid" ? (on ? 1 : 0.85) : undefined}
            />
            <path
              d={`M${w / 2 + 2} ${-h * 0.15} l${spinous} ${drop} l2 ${-h * 0.18} l${-spinous + 4} ${-drop + h * 0.05} Z`}
              {...pl}
              fill={variant === "solid" ? (on ? "var(--color-bronze)" : "currentColor") : "none"}
              fillOpacity={variant === "solid" ? 0.7 : undefined}
            />
          </g>
        );
      })}
      {/* sacrum et coccyx */}
      <path
        d={`M${sacrumTop.x - 22} ${sacrumTop.y + 4} C ${sacrumTop.x - 12} ${sacrumTop.y + 40}, ${sacrumTop.x + 10} ${sacrumTop.y + 84}, ${sacrumTop.x + 40} ${sacrumTop.y + 112} L ${sacrumTop.x + 52} ${sacrumTop.y + 98} C ${sacrumTop.x + 36} ${sacrumTop.y + 60}, ${sacrumTop.x + 30} ${sacrumTop.y + 30}, ${sacrumTop.x + 26} ${sacrumTop.y + 2} Z`}
        style={{ ["--i" as string]: n + 1 }}
        {...pl}
        fill={variant === "solid" ? (highlight.includes("S") ? "var(--color-bronze)" : "currentColor") : "none"}
        fillOpacity={variant === "solid" ? 0.85 : undefined}
      />
      <path
        d={`M${sacrumTop.x + 42} ${sacrumTop.y + 114} q 6 12 -2 22`}
        style={{ ["--i" as string]: n + 2 }}
        {...pl}
      />
    </svg>
  );
}

/** Version horizontale stylisée pour la transition entre pages. */
export function SpineLine({ className = "" }: { className?: string }) {
  const count = 26;
  return (
    <svg viewBox={`0 0 ${count * 24} 24`} preserveAspectRatio="none" className={className} aria-hidden="true">
      <line x1="0" y1="12" x2={count * 24} y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      {Array.from({ length: count }, (_, i) => {
        const h = 8 + Math.sin((i / count) * Math.PI) * 6;
        return <rect key={i} x={i * 24 + 5} y={12 - h / 2} width={14} height={h} rx={3} fill="currentColor" opacity={0.25 + (i / count) * 0.75} />;
      })}
    </svg>
  );
}
