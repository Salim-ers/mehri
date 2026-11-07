import type { DeviceTier, FromWorld, StageConfig, ToWorld } from "./protocol";

/**
 * Hôte du moteur 3D côté page (fil principal), instance unique pour toute la visite.
 *
 * - Le canvas est créé une fois et déplacé d'un emplacement de page à l'autre :
 *   le squelette « voyage » entre les pages (et participe aux transitions de page
 *   grâce à son nom de transition `anatomy-world`).
 * - Le rendu se fait dans un Web Worker (OffscreenCanvas) lorsque le navigateur le
 *   permet ; sinon le même moteur tourne ici, chargé à la demande.
 * - Aucun rendu hors écran ni onglet masqué.
 */
export type HostStatus = "idle" | "loading" | "ready" | "failed";

type Listener = (msg: FromWorld) => void;

const MAX_DPR: Record<DeviceTier, number> = { high: 1.75, low: 1.5 };
/** budget de pixels dessinés : un écran 4K ne fait pas exploser le coût GPU */
const PIXEL_BUDGET: Record<DeviceTier, number> = { high: 3_600_000, low: 1_300_000 };

interface NavigatorHints {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean };
}

export function detectTier(): DeviceTier {
  const nav = navigator as Navigator & NavigatorHints;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  if (nav.connection?.saveData === true || lowMem || lowCpu || (coarse && narrow)) return "low";
  return "high";
}

class WorldHost {
  status: HostStatus = "idle";
  private readonly listeners = new Set<Listener>();
  private readonly stateListeners = new Set<() => void>();
  private host: HTMLDivElement | null = null;
  private send: ((msg: ToWorld) => void) | null = null;
  private worker: Worker | null = null;
  private anchor: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private viewObserver: IntersectionObserver | null = null;
  private inView = false;
  private tier: DeviceTier = "low";
  private shown = false;
  private lastSize = { w: 0, h: 0, dpr: 0 };

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** État observable par React (useSyncExternalStore) : « statut|image affichée ». */
  readonly subscribeState = (cb: () => void): (() => void) => {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  };

  readonly snapshot = (): string => `${this.status}|${this.shown ? 1 : 0}`;

  private notify(): void {
    for (const l of this.stateListeners) l();
  }

  private emit(msg: FromWorld): void {
    if (msg.t === "ready") this.status = "ready";
    if (msg.t === "error") {
      this.status = "failed";
      // plus de canvas dans la page : l'illustration vectorielle prend le relais
      this.host?.remove();
      console.info("Scène 3D indisponible, illustration vectorielle affichée :", msg.message);
    }
    if (msg.t === "shown") this.shown = true;
    if (msg.t === "lost") this.shown = false;
    for (const l of this.listeners) l(msg);
    if (msg.t !== "hover") this.notify();
  }

  post(msg: ToWorld): void {
    this.send?.(msg);
  }

  private dpr(width: number, height: number): number {
    const budget = Math.sqrt(PIXEL_BUDGET[this.tier] / Math.max(1, width * height));
    return Math.max(0.6, Math.min(window.devicePixelRatio || 1, MAX_DPR[this.tier], budget));
  }

  /** Démarre le moteur (une seule fois). */
  load(reducedMotion: boolean): void {
    if (this.status !== "idle") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("no-webgl") || typeof WebGLRenderingContext === "undefined") {
      this.emit({ t: "error", message: "WebGL indisponible" });
      return;
    }
    this.status = "loading";
    this.notify();
    this.tier = detectTier();
    const host = document.createElement("div");
    host.className = "anatomy-world";
    host.setAttribute("aria-hidden", "true");
    this.host = host;
    const force = params.has("force-webgl");
    const init = (canvas: OffscreenCanvas | null): ToWorld => ({
      t: "init",
      canvas,
      width: 2,
      height: 2,
      dpr: 1,
      tier: this.tier,
      reducedMotion,
      force,
    });

    const startMainThread = async () => {
      const canvas = document.createElement("canvas");
      host.replaceChildren(canvas);
      try {
        const { createRuntime } = await import("./runtime");
        const runtime = createRuntime((m) => this.emit(m));
        this.send = (m) => void runtime.onMessage(m, canvas);
        this.send(init(null));
        this.replay();
      } catch (e) {
        this.emit({ t: "error", message: e instanceof Error ? e.message : String(e) });
      }
    };

    const canvas = document.createElement("canvas");
    host.append(canvas);
    const offscreenSupported = typeof canvas.transferControlToOffscreen === "function" && typeof Worker !== "undefined";
    if (!offscreenSupported) {
      void startMainThread();
      return;
    }
    try {
      const worker = new Worker(new URL("./world.worker.ts", import.meta.url), { type: "module", name: "anatomie-3d" });
      this.worker = worker;
      const offscreen = canvas.transferControlToOffscreen();
      let started = false;
      worker.onmessage = (e: MessageEvent<FromWorld>) => {
        started = true;
        this.emit(e.data);
      };
      worker.onerror = (e) => {
        // échec du chargement du worker : repli sur le fil principal avec un nouveau canvas
        e.preventDefault();
        worker.terminate();
        this.worker = null;
        if (!started) void startMainThread();
        else this.emit({ t: "error", message: "Moteur 3D interrompu" });
      };
      this.send = (m) => {
        if (m.t === "init" && m.canvas) worker.postMessage(m, [m.canvas]);
        else worker.postMessage(m);
      };
      this.send(init(offscreen));
      this.replay();
    } catch {
      this.worker = null;
      void startMainThread();
    }
  }

  private config: StageConfig | null = null;

  /** Renvoie l'état courant au moteur (après démarrage ou repli). */
  private replay(): void {
    if (this.lastSize.w) this.send?.({ t: "resize", width: this.lastSize.w, height: this.lastSize.h, dpr: this.lastSize.dpr });
    if (this.config) this.send?.({ t: "config", config: this.config });
    if (this.anchor) {
      this.send?.({ t: "attached" });
      this.send?.({ t: "visible", value: this.inView && !document.hidden });
    }
  }

  private onVisibility = () => {
    this.send?.({ t: "visible", value: this.inView && !document.hidden });
  };

  /** Rattache la scène à un emplacement de page. @returns fonction de détachement */
  attach(anchor: HTMLElement, config: StageConfig): () => void {
    const host = this.host;
    if (!host) return () => undefined;
    this.anchor = anchor;
    this.config = config;
    this.shown = false;
    this.notify();
    anchor.append(host);
    host.style.viewTransitionName = "anatomy-world";

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (w < 2 || h < 2) return;
      const dpr = this.dpr(w, h);
      if (w === this.lastSize.w && h === this.lastSize.h && dpr === this.lastSize.dpr) return;
      this.lastSize = { w, h, dpr };
      this.send?.({ t: "resize", width: w, height: h, dpr });
    });
    this.resizeObserver.observe(host);

    this.viewObserver?.disconnect();
    this.viewObserver = new IntersectionObserver(
      ([entry]) => {
        this.inView = entry?.isIntersecting ?? false;
        this.onVisibility();
      },
      { rootMargin: "120px" },
    );
    this.viewObserver.observe(anchor);
    document.addEventListener("visibilitychange", this.onVisibility);

    this.send?.({ t: "config", config });
    this.send?.({ t: "attached" });

    return () => {
      if (this.anchor !== anchor) return;
      this.anchor = null;
      this.resizeObserver?.disconnect();
      this.viewObserver?.disconnect();
      this.resizeObserver = null;
      this.viewObserver = null;
      document.removeEventListener("visibilitychange", this.onVisibility);
      this.inView = false;
      this.send?.({ t: "visible", value: false });
      host.style.viewTransitionName = "";
      host.remove();
      this.shown = false;
      this.notify();
    };
  }

  update(config: StageConfig): void {
    this.config = config;
    this.send?.({ t: "config", config });
  }
}

let instance: WorldHost | null = null;

/** Hôte unique (créé au premier appel, côté navigateur uniquement). */
export function getWorld(): WorldHost {
  instance ??= new WorldHost();
  return instance;
}

export type { WorldHost };
