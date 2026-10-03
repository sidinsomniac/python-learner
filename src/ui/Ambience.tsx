import { useEffect, useRef, useState } from "react";
import { BANNER_PRESETS, pickPreset, type Preset } from "../engine/ambience";
import { itemById } from "../lore/shop";
import { useGame } from "../engine/store";
import { MAKERS } from "./backdrop";
import { initialQuality, type Frame, type Palette, type Scene } from "./backdrop/engine";

/** The pointer position, shared by every canvas, from -1 to 1 on each axis. */
interface Pointer {
  x: number;
  y: number;
}

/**
 * The castle's living background: a canvas behind everything, drawing one of
 * the presets in `src/engine/ambience.ts`. A new preset is picked (never the
 * same twice in a row) whenever `sceneKey` changes, i.e. each time a new
 * screen opens. The old one fades out while the new one fades in.
 */
export function Ambience({ sceneKey }: { sceneKey: string }) {
  const enabled = useGame((s) => s.ambience);
  const banner = useGame((s) => (s.equipped.banner ? itemById(s.equipped.banner)?.value : undefined));
  const extra = useRef<Preset[]>([]);
  extra.current = banner && BANNER_PRESETS[banner] ? [BANNER_PRESETS[banner].id] : [];
  const reducedMotion = usePrefersReducedMotion();
  const [layers, setLayers] = useState<{ id: number; preset: Preset; leaving: boolean }[]>([]);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((l) => !l.leaving);
      const next = { id: (current?.id ?? 0) + 1, preset: pickPreset(current?.preset ?? null, Math.random, extra.current), leaving: false };
      return [...prev.filter((l) => !l.leaving).map((l) => ({ ...l, leaving: true })), next];
    });
  }, [sceneKey]);

  // Drop faded-out canvases once their fade has finished.
  useEffect(() => {
    if (!layers.some((l) => l.leaving)) return;
    const timer = setTimeout(() => setLayers((prev) => prev.filter((l) => !l.leaving)), 1300);
    return () => clearTimeout(timer);
  }, [layers]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled || reducedMotion) return null;
  return (
    <>
      {layers.map((l) => (
        <AmbienceCanvas key={l.id} preset={l.preset} leaving={l.leaving} pointer={pointer} />
      ))}
    </>
  );
}

/** True when the player has asked their system for less motion. */
export function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => typeof matchMedia !== "undefined" && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function AmbienceCanvas({ preset, leaving, pointer }: { preset: Preset; leaving: boolean; pointer: React.RefObject<Pointer> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const pal: Palette = {
      gold: css.getPropertyValue("--gold").trim() || "#d9b45a",
      gold2: css.getPropertyValue("--gold-2").trim() || "#f3d58a",
      light: document.documentElement.dataset.theme === "light",
      house: useGame.getState().house ?? undefined,
    };
    let w = 0;
    let h = 0;
    let quality = 1;
    let scene: Scene;
    const build = () => {
      scene = MAKERS[preset](w, h, pal, quality);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      quality = initialQuality(w, h);
      build();
    };
    resize();
    window.addEventListener("resize", resize);

    // Smooth the pointer so the parallax glides rather than jumps.
    const frame: Frame = { dt: 0, t: 0, px: 0, py: 0 };
    // If frames run slow for a couple of seconds, draw fewer particles.
    let slowFrames = 0;
    let downgrades = 0;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      frame.dt = Math.min(0.05, elapsed);
      frame.t = now / 1000;
      const ease = 1 - Math.exp(-frame.dt * 2.5);
      frame.px += (pointer.current.x - frame.px) * ease;
      frame.py += (pointer.current.y - frame.py) * ease;
      slowFrames = elapsed > 1 / 40 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 90 && downgrades < 2) {
        quality *= 0.65;
        downgrades += 1;
        slowFrames = 0;
        build();
      }
      ctx.clearRect(0, 0, w, h);
      scene.step(ctx, frame);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();
    const fadeIn = setTimeout(() => setVisible(true), 30);

    return () => {
      clearTimeout(fadeIn);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [preset, pointer]);

  return (
    <canvas
      ref={ref}
      className={`ambience ${visible && !leaving ? "visible" : ""}`}
      data-preset={preset}
      data-testid={leaving ? "ambience-leaving" : "ambience"}
      aria-hidden
    />
  );
}
