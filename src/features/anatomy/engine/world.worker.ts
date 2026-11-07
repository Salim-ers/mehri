import type { FromWorld, ToWorld } from "./protocol";
import { createRuntime } from "./runtime";

/**
 * Point d'entrée du Web Worker : three.js, la construction du squelette et le rendu
 * s'exécutent ici, sur un OffscreenCanvas transféré par la page.
 */
const post = (msg: FromWorld) => self.postMessage(msg);
const runtime = createRuntime(post);

self.onmessage = (event: MessageEvent<ToWorld>) => {
  void runtime.onMessage(event.data);
};
