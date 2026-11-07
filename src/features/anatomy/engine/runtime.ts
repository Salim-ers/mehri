import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getRegion, type MotionDemo, type RegionId } from "@/content/anatomy";
import {
  BODY,
  FOV,
  heroChapterAt,
  heroKeyframes,
  heroPose,
  heroXRayLine,
  introPose,
  overviewPose,
  regionPose,
  SKELETON_UNITS,
} from "../model/director";
import { LookManager, REVEAL_DONE, REVEAL_HIDDEN } from "../model/looks";
import { createBoneFamily, createXRayFamily, FAR_ABOVE, FAR_BELOW, ScanPulse } from "../model/materials";
import { SkeletonAnimator } from "../model/motion";
import { cameraPosition, copyPose, damp, dampPose, OrbitInput, pose, type OrbitPose } from "../model/orbit";
import { createSkeletonAsync, type SkeletonModel } from "../model/skeleton";
import type { DeviceTier, FromWorld, StageConfig, ToWorld } from "./protocol";

/**
 * Moteur 3D unique du site. Il fonctionne dans un Web Worker (OffscreenCanvas) :
 * three.js, la construction du squelette et le rendu n'occupent jamais le fil
 * principal de la page. En repli, le même code tourne sur le fil principal.
 *
 * Le squelette est construit une seule fois par visite ; les pages s'y rattachent
 * tour à tour (aucun contexte WebGL recréé, aucune reconstruction à la navigation).
 */

type Canvas = HTMLCanvasElement | OffscreenCanvas;

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const ENTRANCE = 2.7; // s — ouverture de l'accueil
const QUICK_REVEAL = 1.3; // s — première apparition ailleurs
const TOP = BODY.top + 0.3;
const BOTTOM = BODY.bottom - 0.3;
const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Ombre portée douce sous les pieds (texture calculée, aucun rendu supplémentaire). */
function contactShadow(): THREE.Mesh {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - size / 2 + 0.5) / (size / 2);
      const dy = (y - size / 2 + 0.5) / (size / 2);
      const d = Math.min(1, Math.hypot(dx, dy));
      const a = Math.pow(1 - d, 2.2) * 255;
      const i = (y * size + x) * 4;
      data[i] = 40;
      data[i + 1] = 34;
      data[i + 2] = 30;
      data[i + 3] = a;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.32 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  mesh.renderOrder = -1;
  return mesh;
}

interface Built {
  readonly model: SkeletonModel;
  readonly looks: LookManager;
  readonly animator: SkeletonAnimator;
  readonly bone: ReturnType<typeof createBoneFamily>;
  readonly xray: ReturnType<typeof createXRayFamily>;
}

export class WorldCore {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.3, 80);
  private readonly key = new THREE.DirectionalLight("#fff1e0", 2.7);
  private readonly rim = new THREE.DirectionalLight("#e8c7a0", 1.9);
  private readonly fill = new THREE.DirectionalLight("#dde8ee", 0.55);
  private readonly hemi = new THREE.HemisphereLight("#fff7ee", "#6b5a4c", 0.5);
  private readonly shadow = contactShadow();
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly tmp = { x: 0, y: 0, z: 0 };
  private readonly target = new THREE.Vector3();
  private built: Built | null = null;
  private pulse: ScanPulse | null = null;

  private width = 1;
  private height = 1;
  private config: StageConfig | null = null;
  private progress = 0;
  private heroKeys: OrbitPose[] = [];
  private readonly current = pose({ ty: BODY.centerY, distance: 30 });
  private readonly goal = pose({ ty: BODY.centerY, distance: 30 });
  private readonly input = new OrbitInput();
  private poseReady = false;
  private time = 0;
  private sway = 0;
  private pointer = { x: 0, y: 0, inside: false, sx: 0, sy: 0 };
  private hovered: RegionId | null = null;
  private pickPending = false;
  private line = FAR_ABOVE;
  /** temps écoulé depuis le début de la matérialisation (−1 = terminée) */
  private reveal = -1;
  private revealKind: "entrance" | "quick" = "quick";
  private needsFrame = true;
  private lastActivity = 0;
  private frameParity = 0;
  private announce = false;

  constructor(
    canvas: Canvas,
    private readonly tier: DeviceTier,
    private readonly reducedMotion: boolean,
    private readonly emit: (msg: FromWorld) => void,
    force = false,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === "high",
      alpha: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
    });
    // rendu logiciel (sans GPU) : la 3D serait saccadée → illustration vectorielle à la place
    const gl = this.renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    if (!force && SOFTWARE_RENDERER.test(name)) {
      this.renderer.dispose();
      throw new Error(`Rendu logiciel : ${name}`);
    }
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.add(this.hemi, this.key, this.rim, this.fill, this.shadow);
    this.key.target.position.set(0, BODY.centerY, 0);
    this.rim.target.position.set(0, BODY.centerY, 0);
    this.fill.target.position.set(0, BODY.centerY, 0);
    this.scene.add(this.key.target, this.rim.target, this.fill.target);
    this.placeLights(-0.6);
    this.rim.position.set(6, 6, -6);
    this.fill.position.set(-7, 3, 4);

    if (tier === "high") {
      // reflets doux sur la matière osseuse ; calcul unique (pas d'environnement dynamique)
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.scene.environment = pmrem.fromScene(room, 0.04).texture;
      this.scene.environmentIntensity = 0.32;
      room.dispose();
      pmrem.dispose();
    }

    if ("addEventListener" in canvas) {
      canvas.addEventListener("webglcontextlost", ((e: Event) => {
        e.preventDefault();
        this.emit({ t: "lost" });
      }) as EventListener);
      canvas.addEventListener("webglcontextrestored", (() => {
        this.needsFrame = true;
        this.emit({ t: "restored" });
      }) as EventListener);
    }
  }

  /** Construction découpée du squelette, puis compilation parallèle des shaders. */
  async build(): Promise<void> {
    const bone = createBoneFamily(this.tier === "high" ? "high" : "low");
    const xray = createXRayFamily();
    const model = await createSkeletonAsync(this.tier === "high" ? "high" : "low", bone, undefined);
    const root = new THREE.Group();
    root.scale.setScalar(SKELETON_UNITS);
    root.add(model.root);
    this.scene.add(root);
    root.updateMatrixWorld(true);
    const looks = new LookManager(model, bone, xray, { top: TOP, bottom: BOTTOM });
    const animator = new SkeletonAnimator(model);
    // rien n'est visible avant la matérialisation
    bone.uniforms.uRevealBody.value = REVEAL_HIDDEN;
    bone.uniforms.uRevealSpine.value = REVEAL_HIDDEN;
    this.shadow.visible = false;
    // compile les deux familles de shaders (jumeaux visibles le temps de la compilation)
    looks.setLine(BODY.centerY);
    looks.apply();
    await this.renderer.compileAsync(this.scene, this.camera);
    looks.setLine(FAR_ABOVE);
    looks.apply();
    this.pulse = new ScanPulse(xray.uniforms, TOP, BOTTOM, 9);
    this.built = { model, looks, animator, bone, xray };
    this.needsFrame = true;
    this.emit({ t: "ready" });
  }

  setSize(width: number, height: number, dpr: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.heroKeys = heroKeyframes(this.camera.aspect);
    this.needsFrame = true;
  }

  setConfig(config: StageConfig): void {
    const prev = this.config;
    this.config = config;
    if (!prev || prev.region !== config.region || prev.mode !== config.mode) this.input.lastInteraction = -Infinity;
    this.needsFrame = true;
  }

  setProgress(value: number): void {
    if (Math.abs(value - this.progress) > 1e-4) {
      this.progress = value;
      this.needsFrame = true;
      this.lastActivity = this.time;
    }
  }

  setPointer(x: number, y: number, inside: boolean): void {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.inside = inside;
    this.pickPending = true;
    this.needsFrame = true;
    this.lastActivity = this.time;
  }

  drag(dx: number, dy: number): void {
    this.input.drag(dx, dy, this.time);
    this.needsFrame = true;
    this.lastActivity = this.time;
  }

  zoom(factor: number): void {
    this.input.zoomBy(factor, this.time);
    this.needsFrame = true;
    this.lastActivity = this.time;
  }

  recenter(): void {
    this.input.lastInteraction = -Infinity;
    this.needsFrame = true;
  }

  /** Nouveau rattachement : première fois → matérialisation ; ensuite → la caméra rejoint son nouveau cadrage. */
  attached(): void {
    const firstTime = !this.poseReady;
    if (firstTime) {
      const hero = this.config?.mode === "hero";
      this.revealKind = hero ? "entrance" : "quick";
      this.reveal = this.reducedMotion ? -1 : 0;
      if (this.reducedMotion && this.built) {
        this.built.bone.uniforms.uRevealBody.value = REVEAL_DONE;
        this.built.bone.uniforms.uRevealSpine.value = REVEAL_DONE;
      }
      this.computeGoal(0);
      if (hero && !this.reducedMotion) copyPose(this.current, introPose(this.camera.aspect));
      else copyPose(this.current, this.goal);
      this.poseReady = true;
    }
    this.announce = true;
    this.needsFrame = true;
  }

  get ready(): boolean {
    return this.built !== null;
  }

  private placeLights(azimuth: number): void {
    this.key.position.set(Math.sin(azimuth) * 9, 9.5, Math.cos(azimuth) * 9);
  }

  /** Pose visée selon le mode, la région et la progression de l'accueil. */
  private computeGoal(dt: number): void {
    const c = this.config;
    if (!c) return;
    const aspect = this.camera.aspect;
    if (c.mode === "hero") {
      heroPose(this.progress, this.heroKeys, this.goal);
    } else if (c.region) {
      copyPose(this.goal, regionPose(c.region, c.mode, aspect));
    } else {
      copyPose(this.goal, overviewPose(c.mode, aspect));
    }
    // présence : léger va-et-vient et réponse au pointeur (jamais en mouvement réduit)
    const motion = c.playing && !this.reducedMotion;
    if (motion) this.sway += dt * 0.22;
    const swayAmp = c.mode === "hero" ? 0.14 : c.mode === "explore" ? 0.08 : 0.1;
    const userActive = this.time - this.input.lastInteraction < 6;
    if (motion && !userActive) this.goal.yaw += Math.sin(this.sway) * swayAmp;
    const follow = !this.reducedMotion && this.pointer.inside ? 1 : 0;
    this.pointer.sx = damp(this.pointer.sx, this.pointer.x * follow, 3, dt);
    this.pointer.sy = damp(this.pointer.sy, this.pointer.y * follow, 3, dt);
    if (c.mode === "hero" || c.mode === "finder") {
      this.goal.yaw += this.pointer.sx * 0.22;
      this.goal.pitch += this.pointer.sy * 0.06;
    }
    // manipulations de l'utilisateur (explorateur) ; retour doux au cadrage lorsqu'il s'arrête
    if (c.mode === "explore") {
      if (!userActive) this.input.relax(1.2, dt);
      this.goal.yaw += this.input.yaw;
      this.goal.pitch = Math.min(1.1, Math.max(-0.6, this.goal.pitch + this.input.pitch));
      this.goal.distance *= this.input.zoom;
    }
  }

  private applyCamera(): void {
    const p = this.current;
    cameraPosition(p, this.tmp);
    this.camera.position.set(this.tmp.x, this.tmp.y, this.tmp.z);
    this.target.set(p.tx, p.ty, p.tz);
    this.camera.lookAt(this.target);
    // décentrage d'objectif : le sujet prend sa place dans la composition sans déformation
    if (Math.abs(p.shiftX) > 1e-4 || Math.abs(p.shiftY) > 1e-4) {
      this.camera.setViewOffset(this.width, this.height, -p.shiftX * this.width, p.shiftY * this.height, this.width, this.height);
    } else if (this.camera.view) {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  private updateReveal(dt: number, b: Built): boolean {
    if (this.reveal < 0) return false;
    this.reveal += dt;
    const t = this.reveal;
    const u = b.bone.uniforms;
    const span = TOP - BOTTOM + 0.6;
    if (this.revealKind === "entrance") {
      // la colonne d'abord, de haut en bas, puis le reste du squelette ; la lumière tourne
      const spine = easeOut((t - 0.1) / 1.35);
      const body = easeOut((t - 1.0) / 1.5);
      u.uRevealSpine.value = spine >= 1 ? REVEAL_DONE : TOP + 0.3 - spine * span;
      u.uRevealBody.value = body >= 1 ? REVEAL_DONE : TOP + 0.3 - body * span;
      u.uEdgeGain.value = 1.4 * (1 - smooth((t - 2.0) / 0.7));
      this.placeLights(-1.5 + 0.9 * easeOut(t / ENTRANCE));
      if (t >= ENTRANCE) this.reveal = -1;
    } else {
      const k = easeOut(t / QUICK_REVEAL);
      const y = TOP + 0.3 - k * span;
      u.uRevealSpine.value = k >= 1 ? REVEAL_DONE : y;
      u.uRevealBody.value = k >= 1 ? REVEAL_DONE : y + 0.4;
      u.uEdgeGain.value = 1.1 * (1 - smooth((t - 0.8) / 0.5));
      if (t >= QUICK_REVEAL) this.reveal = -1;
    }
    if (this.reveal < 0) {
      u.uRevealSpine.value = REVEAL_DONE;
      u.uRevealBody.value = REVEAL_DONE;
      u.uEdgeGain.value = 0;
      this.placeLights(-0.6);
    }
    return true;
  }

  /**
   * Avance la scène d'un pas et dessine.
   * @returns vrai si une autre image est nécessaire (animation en cours)
   */
  frame(dtRaw: number): boolean {
    const b = this.built;
    const c = this.config;
    if (!b || !c || !this.poseReady) return false;
    const dt = Math.min(0.05, dtRaw);
    this.time += dt;
    let animating = this.updateReveal(dt, b);

    // caméra
    const entrance = this.revealKind === "entrance" && this.reveal >= 0;
    this.computeGoal(dt);
    const lambda = entrance ? 1.15 : c.mode === "hero" ? 5.5 : 3.2;
    const gap = dampPose(this.current, this.goal, lambda, dt);
    if (gap > 2e-4) animating = true;
    this.applyCamera();

    // survol : lancer de rayon une fois par image au plus
    if (this.pickPending && c.hover) {
      this.pickPending = false;
      let region: RegionId | null = null;
      if (this.pointer.inside) {
        this.ndc.set(this.pointer.x, this.pointer.y);
        this.raycaster.setFromCamera(this.ndc, this.camera);
        region = b.looks.pick(this.raycaster);
      }
      if (region !== this.hovered) {
        this.hovered = region;
        this.emit({ t: "hover", region });
      }
    } else if (!c.hover && this.hovered) {
      this.hovered = null;
      this.emit({ t: "hover", region: null });
    }

    // région mise en avant et démonstration
    let focus: RegionId | null = c.region;
    let demo: MotionDemo | null = c.demo && c.region ? getRegion(c.region).movement.demo : null;
    if (c.mode === "hero") {
      const chapter = heroChapterAt(this.progress);
      focus = chapter?.region ?? null;
      demo = chapter?.demo ?? null;
    }
    b.looks.setRegion(focus, c.hover ? this.hovered : null, c.isolate);
    const autoplay = c.playing && !this.reducedMotion;
    // accueil : démonstrations automatiques ; ailleurs : uniquement à la demande de l'utilisateur
    const demoActive = demo !== null && (c.mode === "hero" ? autoplay : c.demo);
    b.animator.setDemo(demoActive ? demo : null);
    if (b.animator.update(dt, demoActive)) animating = true;

    // bascule radiographique (balayage)
    const lineGoal = c.mode === "hero" ? heroXRayLine(this.progress) : c.look === "xray" ? FAR_BELOW : FAR_ABOVE;
    const goalClamped = Math.min(TOP + 1.5, Math.max(BOTTOM - 1.5, lineGoal));
    const from = Math.min(TOP + 1.5, Math.max(BOTTOM - 1.5, this.line));
    let next = goalClamped;
    if (c.mode !== "hero" && !this.reducedMotion) {
      // vitesse constante : un passage complet dure ≈ 1,6 s
      const step = dt * ((TOP - BOTTOM + 3) / 1.6);
      next = from + Math.max(-step, Math.min(step, goalClamped - from));
    }
    this.line = next;
    if (Math.abs(next - goalClamped) > 1e-3) animating = true;
    const fullX = this.line <= BOTTOM - 1.4;
    b.looks.setLine(this.line <= BOTTOM - 1.4 ? FAR_BELOW : this.line >= TOP + 1.4 ? FAR_ABOVE : this.line);
    const xu = b.xray.uniforms;
    if (fullX) {
      this.pulse?.update(dt, autoplay);
      if (autoplay) animating = true;
      if (!autoplay) {
        xu.uRevealAll.value = 1;
        xu.uBandGain.value = 0;
      }
    } else {
      xu.uScan.value = this.line;
      xu.uRevealAll.value = 0;
      xu.uBandGain.value = this.line < TOP + 1.2 && this.line > BOTTOM - 1.2 ? 0.95 : 0;
      this.pulse?.restart();
    }
    b.looks.apply();

    const xr = b.looks.xrayAmount;
    this.shadow.visible = xr < 0.98;
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - xr);

    // présence permanente (va-et-vient) : cadence réduite lorsqu'il ne se passe rien d'autre
    const swaying = autoplay;
    const quiet = !animating && this.time - this.lastActivity > 3;
    if (swaying) animating = true;
    if (swaying && quiet && this.tier === "low") {
      this.frameParity ^= 1;
      if (this.frameParity) return true; // une image sur deux : la présence reste fluide, le GPU respire
    }

    this.renderer.render(this.scene, this.camera);
    if (this.announce) {
      this.announce = false;
      this.emit({ t: "shown" });
    }
    const more = animating || this.needsFrame;
    this.needsFrame = false;
    return more;
  }

  dispose(): void {
    const b = this.built;
    if (b) {
      for (const g of b.model.geometries) g.dispose();
      b.bone.dispose();
      b.xray.dispose();
    }
    this.scene.environment?.dispose();
    const sm = this.shadow.material as THREE.MeshBasicMaterial;
    sm.map?.dispose();
    sm.dispose();
    this.shadow.geometry.dispose();
    this.renderer.dispose();
  }
}

/* ──────────────────────────────────────────────────────────────
   Exécution : boucle d'affichage à la demande + traitement des messages.
   ────────────────────────────────────────────────────────────── */

type RafScope = {
  requestAnimationFrame?: (cb: (t: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
};

export function createRuntime(emit: (msg: FromWorld) => void) {
  let core: WorldCore | null = null;
  let visible = false;
  let raf = 0;
  let last = 0;
  let pendingConfig: StageConfig | null = null;
  let pendingAttach = false;
  const scope = globalThis as unknown as RafScope;
  const request = (cb: (t: number) => void): number =>
    scope.requestAnimationFrame ? scope.requestAnimationFrame(cb) : (setTimeout(() => cb(performance.now()), 16) as unknown as number);
  const cancel = (id: number) => (scope.cancelAnimationFrame ? scope.cancelAnimationFrame(id) : clearTimeout(id));

  const tick = (now: number) => {
    raf = 0;
    if (!core || !visible) return;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    if (core.frame(dt)) raf = request(tick);
    else last = 0;
  };
  const wake = () => {
    if (!raf && core?.ready && visible) {
      last = 0;
      raf = request(tick);
    }
  };

  return {
    async onMessage(msg: ToWorld, canvasOverride?: Canvas): Promise<void> {
      switch (msg.t) {
        case "init": {
          const canvas = msg.canvas ?? canvasOverride;
          if (!canvas) {
            emit({ t: "error", message: "Aucune surface de rendu" });
            return;
          }
          try {
            core = new WorldCore(
              canvas,
              msg.tier,
              msg.reducedMotion,
              (m) => {
                emit(m);
                if (m.t === "restored") wake();
              },
              msg.force,
            );
            core.setSize(msg.width, msg.height, msg.dpr);
            await core.build();
            if (pendingConfig) core.setConfig(pendingConfig);
            if (pendingAttach) core.attached();
            wake();
          } catch (e) {
            emit({ t: "error", message: e instanceof Error ? e.message : String(e) });
            core = null;
          }
          return;
        }
        case "config":
          pendingConfig = msg.config;
          core?.setConfig(msg.config);
          break;
        case "attached":
          pendingAttach = true;
          if (core?.ready) core.attached();
          break;
        case "resize":
          core?.setSize(msg.width, msg.height, msg.dpr);
          // dessin immédiat : pas d'image vide pendant un redimensionnement
          if (core?.ready && visible) core.frame(0);
          break;
        case "progress":
          core?.setProgress(msg.value);
          break;
        case "pointer":
          core?.setPointer(msg.x, msg.y, msg.inside);
          break;
        case "drag":
          core?.drag(msg.dx, msg.dy);
          break;
        case "zoom":
          core?.zoom(msg.factor);
          break;
        case "recenter":
          core?.recenter();
          break;
        case "visible":
          visible = msg.value;
          if (!visible && raf) {
            cancel(raf);
            raf = 0;
          }
          break;
      }
      wake();
    },
    /** premier rendu après un rattachement (le fil principal affiche alors le canvas) */
    get ready() {
      return core?.ready ?? false;
    },
  };
}
