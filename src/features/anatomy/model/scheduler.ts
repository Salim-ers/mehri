/**
 * Construction découpée des modèles 3D : les générateurs « yield » entre deux os.
 * - runSync : exécution d'un bloc (tests, Node).
 * - runAsync : rend la main au navigateur toutes les ~8 ms, pour ne jamais créer
 *   de tâche longue (> 50 ms) qui dégraderait la réactivité (INP).
 */
export type Builder<T> = Generator<void, T, void>;

export function runSync<T>(builder: Builder<T>): T {
  for (;;) {
    const step = builder.next();
    if (step.done) return step.value;
  }
}

interface SchedulerLike {
  yield?: () => Promise<void>;
}

function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function runAsync<T>(builder: Builder<T>, budgetMs = 8, signal?: AbortSignal): Promise<T> {
  let start = performance.now();
  for (;;) {
    if (signal?.aborted) throw new DOMException("Construction annulée", "AbortError");
    const step = builder.next();
    if (step.done) return step.value;
    if (performance.now() - start > budgetMs) {
      await yieldToMain();
      start = performance.now();
    }
  }
}
