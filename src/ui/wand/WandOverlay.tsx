import { EditorView, type Extension } from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef } from "react";
import { add, advance, drawFx, LOOKS, spawn, spawnPuff, type Particle, type WandEffect } from "./effects";
import { drawWand, WAND_TILT } from "./drawWand";

/** How far the canvas reaches beyond the editor, so the wand can lean out over its edge. */
const PAD = 90;
/** Seconds after the last keystroke before the wand fades away. */
const IDLE = 2;

/**
 * Draws the equipped wand over an editor while you type: it hovers at the
 * cursor, pointing down at the letter you just wrote, and casts its effect
 * there. The animation loop runs only while something is moving.
 */
class WandCaster {
  effect: WandEffect = "sparks";
  light = false;
  enabled = true;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private w = 0;
  private h = 0;
  /** The wand's tip, where it's heading, its fade, its keystroke dip and flare. */
  private x = 0;
  private y = 0;
  private tx = 0;
  private ty = 0;
  private alpha = 0;
  private dip = 0;
  private flare = 0;
  private lastActive = -Infinity;
  private keys = 0;
  private raf = 0;
  private last = 0;
  private resize?: ResizeObserver;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    const host = canvas.parentElement!;
    this.resize = new ResizeObserver(() => this.fit(host));
    this.resize.observe(host);
    this.fit(host);
  }

  detach() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resize?.disconnect();
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }

  private fit(host: HTMLElement) {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = host.clientWidth + PAD * 2;
    this.h = host.clientHeight + PAD * 2;
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Convert a point on screen (from CodeMirror) into canvas coordinates. */
  private local(cx: number, cy: number) {
    const r = this.canvas!.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  }

  /** A keystroke: `x`/`bottom` is the cursor on screen, `cw` a character's width. */
  cast(x: number, bottom: number, cw: number, deleting: boolean) {
    if (!this.canvas || !this.enabled) return;
    const p = this.local(x, bottom);
    const now = performance.now() / 1000;
    if (this.alpha < 0.05) {
      // Appear right at the cursor rather than flying in from the last spot.
      this.x = p.x + 2;
      this.y = p.y - 2;
    }
    this.tx = p.x + 2;
    this.ty = p.y - 2;
    this.lastActive = now;
    this.keys += 1;
    if (deleting) {
      add(this.particles, spawnPuff(this.effect, p.x + cw * 0.5, p.y));
    } else {
      this.dip = 1;
      this.flare = 1;
      add(this.particles, spawn(this.effect, p.x - cw * 0.5, p.y, this.keys, { x: this.x, y: this.y }));
    }
    this.start();
  }

  /** The cursor moved without typing: glide there, if the wand is showing. */
  move(x: number, bottom: number) {
    if (!this.canvas || this.alpha < 0.05) return;
    const p = this.local(x, bottom);
    this.tx = p.x + 2;
    this.ty = p.y - 2;
    this.start();
  }

  private start() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (nowMs: number) => {
    const ctx = this.ctx;
    if (!ctx) return;
    const dt = Math.min(0.05, (nowMs - this.last) / 1000);
    this.last = nowMs;
    const now = nowMs / 1000;

    const ease = 1 - Math.exp(-dt * 20);
    this.x += (this.tx - this.x) * ease;
    this.y += (this.ty - this.y) * ease;
    const showing = now - this.lastActive < IDLE;
    this.alpha += ((showing ? 1 : 0) - this.alpha) * (1 - Math.exp(-dt * (showing ? 14 : 4)));
    this.dip *= Math.exp(-dt * 12);
    this.flare *= Math.exp(-dt * 7);

    advance(this.particles, dt);
    ctx.clearRect(0, 0, this.w, this.h);
    drawFx(ctx, this.particles, this.light);
    // Each keystroke dips the wand a little, like a flick of the wrist.
    const angle = WAND_TILT - this.dip * 0.12;
    drawWand(ctx, this.x, this.y + this.dip * 1.5, angle, this.alpha, this.flare, now, LOOKS[this.effect], this.light);

    if (this.particles.length === 0 && !showing && this.alpha < 0.01) {
      ctx.clearRect(0, 0, this.w, this.h);
      this.alpha = 0;
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}

/**
 * The wand effect for one editor: a CodeMirror extension that reports typing,
 * and the canvas to draw on. Pass `effect: null` to switch it off.
 */
export function useWandFx(effect: WandEffect | null, light: boolean): { extension: Extension; overlay: React.ReactNode } {
  const caster = useRef<WandCaster | null>(null);
  if (!caster.current) caster.current = new WandCaster();
  const c = caster.current;
  c.enabled = effect !== null;
  if (effect) c.effect = effect;
  c.light = light;

  const extension = useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (!c.enabled) return;
        const typed = update.transactions.some((tr) => tr.isUserEvent("input"));
        const deleted = update.transactions.some((tr) => tr.isUserEvent("delete"));
        if (!typed && !deleted && !update.selectionSet) return;
        // Layout can't be read during an update, so measure on CodeMirror's next read phase.
        update.view.requestMeasure({
          read: (view) => ({ at: view.coordsAtPos(view.state.selection.main.head), cw: view.defaultCharacterWidth }),
          write: ({ at, cw }) => {
            if (!at) return;
            if (typed || deleted) c.cast(at.left, at.bottom, cw, deleted && !typed);
            else c.move(at.left, at.bottom);
          },
        });
      }),
    [c],
  );

  const ref = useRef<HTMLCanvasElement>(null);
  const on = effect !== null;
  useEffect(() => {
    if (!on || !ref.current) return;
    c.attach(ref.current);
    return () => c.detach();
  }, [c, on]);

  const overlay = on ? <canvas ref={ref} className="wand-overlay" style={{ left: -PAD, top: -PAD }} aria-hidden data-testid="wand-overlay" /> : null;
  return { extension, overlay };
}
