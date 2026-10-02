// Shared drawing kit for the living backgrounds: cached glow sprites, light
// blending, depth layers with gentle parallax, and particle-count scaling.

export interface Palette {
  /** The year's accent colours, as CSS colours. */
  gold: string;
  gold2: string;
  /** The light (Lumos) theme: draw darker, without additive blending. */
  light: boolean;
}

export interface Frame {
  dt: number;
  t: number;
  /** The pointer, smoothed, from -1 (left/top) to 1 (right/bottom). */
  px: number;
  py: number;
}

export interface Scene {
  step: (ctx: CanvasRenderingContext2D, f: Frame) => void;
}

/** Builds a preset for a w x h screen. `q` scales particle counts (about 0.4 to 1.3). */
export type Maker = (w: number, h: number, pal: Palette, q: number) => Scene;

export const TAU = Math.PI * 2;
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** A particle count scaled by quality, never below 1. */
export const count = (n: number, q: number) => Math.max(1, Math.round(n * q));

// ---------------------------------------------------------------------------
// Glow sprites: a soft radial blob, drawn once per colour and stamped with
// drawImage, which is far cheaper than building a gradient every frame.
// ---------------------------------------------------------------------------

const sprites = new Map<string, HTMLCanvasElement>();
const SPRITE = 64;

/** `rgb` is "r,g,b". `hard` makes a brighter core with a quicker falloff. */
function sprite(rgb: string, hard: boolean): HTMLCanvasElement {
  const key = `${rgb}|${hard}`;
  let canvas = sprites.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = SPRITE;
    const c = canvas.getContext("2d")!;
    const g = c.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    if (hard) {
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(0.18, `rgba(${rgb},0.85)`);
      g.addColorStop(0.45, `rgba(${rgb},0.22)`);
    } else {
      g.addColorStop(0, `rgba(${rgb},0.9)`);
      g.addColorStop(0.35, `rgba(${rgb},0.4)`);
      g.addColorStop(0.7, `rgba(${rgb},0.1)`);
    }
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, SPRITE, SPRITE);
    sprites.set(key, canvas);
  }
  return canvas;
}

/** A soft glow of radius r. */
export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, alpha: number, hard = false) {
  if (alpha <= 0.002 || r <= 0.2) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite(rgb, hard), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** Run `draw` with light-adding blending on dark themes (things glow and bloom where they overlap). */
export function additive(ctx: CanvasRenderingContext2D, pal: Palette, draw: () => void) {
  ctx.globalCompositeOperation = pal.light ? "source-over" : "lighter";
  draw();
  ctx.globalCompositeOperation = "source-over";
}

/** How far a layer at `depth` (0 = far away, 1 = close) shifts with the pointer. */
export function parallax(f: Frame, depth: number) {
  return { x: -f.px * depth * 26, y: -f.py * depth * 14 };
}

/** Wrap v into [lo, hi). */
export function wrap(v: number, lo: number, hi: number) {
  const span = hi - lo;
  return ((((v - lo) % span) + span) % span) + lo;
}

/** Parse "#rrggbb" or "rgb(...)" into "r,g,b" (falls back to warm gold). */
export function toRgb(color: string): string {
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const rgb = color.match(/rgba?\(([^)]+)\)/);
  if (rgb) return rgb[1].split(",").slice(0, 3).map((v) => v.trim()).join(",");
  return "217,180,90";
}

// ---------------------------------------------------------------------------
// Stars, used by several night-sky presets.
// ---------------------------------------------------------------------------

export interface Star {
  x: number;
  y: number;
  r: number;
  p: number;
  depth: number;
}

export function starField(w: number, h: number, n: number, top = 0.75): Star[] {
  return Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h * top), r: rand(0.3, 1.5), p: rand(0, TAU), depth: rand(0, 0.35) }));
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], f: Frame, pal: Palette) {
  const rgb = pal.light ? "90,70,30" : "255,255,255";
  for (const s of stars) {
    const tw = 0.5 + 0.5 * Math.sin(f.t * (0.8 + s.r) + s.p);
    const o = parallax(f, s.depth);
    const a = (pal.light ? 0.35 : 0.55) * (0.35 + 0.65 * tw);
    glow(ctx, s.x + o.x, s.y + o.y, s.r * 3.2, rgb, a, true);
    // The brightest stars sparkle with a faint cross now and then.
    if (s.r > 1.25 && tw > 0.93) {
      ctx.strokeStyle = `rgba(${rgb},${0.5 * (tw - 0.93) * 14})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(s.x + o.x - 6, s.y + o.y);
      ctx.lineTo(s.x + o.x + 6, s.y + o.y);
      ctx.moveTo(s.x + o.x, s.y + o.y - 6);
      ctx.lineTo(s.x + o.x, s.y + o.y + 6);
      ctx.stroke();
    }
  }
}

/** A starting quality from the screen size and the number of CPU cores. */
export function initialQuality(w: number, h: number) {
  const area = clamp(Math.sqrt((w * h) / (1440 * 900)), 0.6, 1.25);
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  return area * (cores <= 4 ? 0.75 : 1);
}
