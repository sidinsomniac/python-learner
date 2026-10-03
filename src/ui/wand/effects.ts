// What each wand casts while you type: hand-drawn Canvas 2D particles that
// burst from the base of each freshly typed letter. No libraries.
//
// The physics (`spawn`, `advance`) is kept apart from the drawing (`drawFx`),
// so it can be tested without a canvas.
import { TAU, glow, rand } from "../backdrop/engine";
import { drawSparkle, moveSparkle } from "../backdrop/sparkles";

import type { WandEffect } from "../../lore/shop";

export type { WandEffect };

export interface WandLook {
  /** Shown on the shop card: "Casts: ...". */
  casts: string;
  /** Wood of the shaft and the handle, as CSS colours. */
  wood: string;
  handle: string;
  /** The tip's glow and the effect's main colour, as "r,g,b" (dark theme). */
  glow: string;
  /** The same colour, darker, for the light (Lumos) theme. */
  glowLight: string;
  /** Wand shape: knobbly (Elder), twisted (Vine) or plain. */
  shape: "plain" | "knobbly" | "twisted";
}

export const LOOKS: Record<WandEffect, WandLook> = {
  sparks: { casts: "warm golden sparks", wood: "#8a3a2c", handle: "#5e2219", glow: "255,196,90", glowLight: "176,110,20", shape: "plain" },
  motes: { casts: "floating silver seed-motes", wood: "#c9a877", handle: "#8f6d43", glow: "225,235,255", glowLight: "90,105,140", shape: "plain" },
  ripples: { casts: "raindrops and ripples", wood: "#7d8a74", handle: "#55604f", glow: "120,190,255", glowLight: "30,100,180", shape: "plain" },
  tendrils: { casts: "curling vine tendrils", wood: "#4f6b35", handle: "#344a22", glow: "130,220,120", glowLight: "40,120,40", shape: "twisted" },
  ink: { casts: "splashes of enchanted ink", wood: "#1c1a22", handle: "#0d0c10", glow: "170,110,255", glowLight: "90,40,170", shape: "plain" },
  embers: { casts: "rising phoenix embers", wood: "#5a3524", handle: "#3a1f14", glow: "255,130,50", glowLight: "190,70,10", shape: "plain" },
  patronus: { casts: "Patronus sparkles and lightning", wood: "#9b8f80", handle: "#6b6055", glow: "200,225,255", glowLight: "70,90,140", shape: "knobbly" },
};

export interface Particle {
  effect: WandEffect;
  /** A variant within the effect: a droplet vs its ripple, an ink blot vs a drop, a deletion puff. */
  part: "main" | "drop" | "ring" | "flash" | "bolt" | "puff";
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  r: number;
  rate: number;
  seed: number;
  /** For drops: the line they land on. For tendrils: curl. For bolts: where they start. */
  a: number;
  b: number;
  /** Bolt zig-zag points, made once so the bolt doesn't jitter. */
  pts?: number[];
}

/** Particles allowed per editor at once: fast typing never floods the frame. */
export const MAX_PARTICLES = 220;

function make(effect: WandEffect, part: Particle["part"], x: number, y: number, o: Partial<Particle>): Particle {
  return { effect, part, x, y, vx: 0, vy: 0, age: 0, life: 1, r: 1, rate: rand(6, 14), seed: rand(0, TAU), a: 0, b: 0, ...o };
}

/**
 * The particles a keystroke casts at (x, y), the base of the new letter.
 * `tip` is the wand's tip (for the Elder Wand's lightning), and `n` counts
 * keystrokes, so some effects can do something special every few keys.
 */
export function spawn(effect: WandEffect, x: number, y: number, n: number, tip?: { x: number; y: number }): Particle[] {
  const out: Particle[] = [];
  switch (effect) {
    case "sparks":
      for (let i = 0; i < 6; i++)
        out.push(make(effect, "main", x + rand(-3, 3), y - 2, { vx: rand(-55, 55), vy: rand(-80, -25), life: rand(0.5, 1), r: rand(1.2, 2.2) }));
      out.push(make(effect, "flash", x, y - 3, { life: 0.22, r: 9 }));
      break;
    case "motes":
      for (let i = 0; i < 3; i++)
        out.push(make(effect, "main", x + rand(-4, 4), y - 4, { vx: rand(-8, 8), vy: rand(-30, -14), life: rand(1.4, 2.4), r: rand(1.3, 2.3) }));
      break;
    case "ripples":
      out.push(make(effect, "drop", x + rand(-2, 2), y - rand(16, 24), { vy: rand(40, 70), life: 1.2, r: 1.6, a: y }));
      out.push(make(effect, "ring", x, y, { life: 0.9, r: 1 }));
      break;
    case "tendrils":
      out.push(make(effect, "main", x, y - 1, { life: rand(1.1, 1.6), r: rand(5, 8), a: rand(-1.2, -0.4) * (Math.random() < 0.5 ? -1 : 1), b: rand(2.2, 3.6) }));
      out.push(make(effect, "flash", x, y - 2, { life: 0.3, r: 6 }));
      break;
    case "ink":
      out.push(make(effect, "main", x, y - 2, { life: rand(0.9, 1.3), r: rand(2.6, 3.6) }));
      for (let i = 0; i < 5; i++) {
        const ang = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const sp = rand(40, 90);
        out.push(make(effect, "drop", x, y - 2, { vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: rand(0.6, 1), r: rand(0.8, 1.6) }));
      }
      break;
    case "embers":
      for (let i = 0; i < 5; i++)
        out.push(make(effect, "main", x + rand(-4, 4), y - 2, { vx: rand(-14, 14), vy: rand(-85, -40), life: rand(0.8, 1.5), r: rand(0.9, 1.9) }));
      out.push(make(effect, "flash", x, y - 4, { life: 0.22, r: 9 }));
      break;
    case "patronus":
      for (let i = 0; i < 6; i++)
        out.push(make(effect, "main", x + rand(-4, 4), y - rand(0, 4), { vx: rand(-40, 40), vy: rand(-55, 0), life: rand(0.8, 1.6), r: rand(0.7, 1.9) }));
      if (tip && n % 5 === 0) out.push(make(effect, "bolt", x, y - 3, { life: 0.22, a: tip.x, b: tip.y, pts: boltPoints(tip.x, tip.y, x, y - 3) }));
      break;
  }
  return out;
}

/** A small puff when you delete: half-size, in the wand's colour. */
export function spawnPuff(effect: WandEffect, x: number, y: number): Particle[] {
  return Array.from({ length: 3 }, () => make(effect, "puff", x + rand(-3, 3), y - 4, { vx: rand(-20, 20), vy: rand(-25, -5), life: rand(0.3, 0.55), r: rand(0.8, 1.4) }));
}

function boltPoints(x0: number, y0: number, x1: number, y1: number): number[] {
  const pts = [x0, y0];
  const steps = 6;
  const len = Math.hypot(x1 - x0, y1 - y0);
  // A zig-zag sideways to the bolt's direction.
  const nx = -(y1 - y0) / (len || 1);
  const ny = (x1 - x0) / (len || 1);
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    const off = rand(-1, 1) * Math.min(9, len * 0.12);
    pts.push(x0 + (x1 - x0) * k + nx * off, y0 + (y1 - y0) * k + ny * off);
  }
  pts.push(x1, y1);
  return pts;
}

/** Add new particles, dropping the oldest if the cap would be passed. */
export function add(list: Particle[], fresh: Particle[]) {
  list.push(...fresh);
  if (list.length > MAX_PARTICLES) list.splice(0, list.length - MAX_PARTICLES);
}

/** Move every particle on by dt, removing the dead. Droplets that land become ripples. */
export function advance(list: Particle[], dt: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.age += dt;
    if (p.age >= p.life) {
      list.splice(i, 1);
      continue;
    }
    switch (p.effect) {
      case "sparks":
        p.vy += 160 * dt;
        p.vx *= Math.exp(-dt * 2);
        break;
      case "motes":
        p.vx = Math.sin(p.age * 2.4 + p.seed) * 9;
        p.vy *= Math.exp(-dt * 0.6);
        break;
      case "ripples":
        if (p.part === "drop") {
          p.vy += 220 * dt;
          if (p.y + p.vy * dt >= p.a) {
            // It lands on the line: a new ring spreads where it fell.
            list[i] = make("ripples", "ring", p.x, p.a, { life: 0.9, r: 1 });
            continue;
          }
        }
        break;
      case "ink":
        if (p.part === "drop") p.vy += 260 * dt;
        break;
      case "embers":
        p.vx += Math.sin(p.age * 9 + p.seed) * 40 * dt;
        p.vy *= Math.exp(-dt * 0.9);
        break;
      case "patronus":
        if (p.part === "main") {
          moveSparkle(p, dt);
          continue;
        }
        break;
      default:
        break;
    }
    if (p.part === "puff") p.vx *= Math.exp(-dt * 3);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

/** Draw every particle. `light` is the Lumos theme: darker colours, normal blending. */
export function drawFx(ctx: CanvasRenderingContext2D, list: Particle[], light: boolean) {
  ctx.globalCompositeOperation = light ? "source-over" : "lighter";
  const white = light ? "40,40,60" : "255,255,255";
  for (const p of list) {
    const look = LOOKS[p.effect];
    const rgb = light ? look.glowLight : look.glow;
    const k = p.age / p.life;
    const fade = Math.min(1, p.age / 0.06) * (1 - k);
    if (p.part === "puff") {
      glow(ctx, p.x, p.y, p.r * 4, rgb, 0.5 * fade);
      continue;
    }
    if (p.part === "flash") {
      glow(ctx, p.x, p.y, p.r * (1 + k), rgb, 0.55 * (1 - k));
      continue;
    }
    switch (p.effect) {
      case "sparks":
        glow(ctx, p.x, p.y, p.r * 4, rgb, 0.45 * fade);
        glow(ctx, p.x, p.y, p.r * 1.3, white, 0.9 * fade, true);
        break;
      case "motes": {
        const tw = 0.6 + 0.4 * Math.sin(p.age * p.rate + p.seed);
        // Soft, slow and round, like dandelion seeds caught in moonlight.
        glow(ctx, p.x, p.y, p.r * 6, rgb, 0.22 * fade * tw);
        glow(ctx, p.x, p.y, p.r * 2.2, rgb, 0.35 * fade * tw);
        glow(ctx, p.x, p.y, p.r * 0.9, white, 0.85 * fade * tw, true);
        break;
      }
      case "ripples":
        if (p.part === "drop") {
          glow(ctx, p.x, p.y, 4, rgb, 0.4);
          ctx.fillStyle = `rgba(${white},0.85)`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 1.3, 2.2, 0, 0, TAU);
          ctx.fill();
        } else {
          const rx = 2 + 16 * Math.sqrt(k);
          ctx.strokeStyle = `rgba(${rgb},${0.8 * (1 - k)})`;
          ctx.lineWidth = 1.2 * (1 - k) + 0.3;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, rx, rx * 0.28, 0, 0, TAU);
          ctx.stroke();
          if (k < 0.5) {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, rx * 0.5, rx * 0.14, 0, 0, TAU);
            ctx.stroke();
          }
        }
        break;
      case "tendrils":
        drawTendril(ctx, p, rgb, light);
        break;
      case "ink":
        if (p.part === "main") {
          const r = p.r * (1 + 1.4 * Math.min(1, k * 4));
          glow(ctx, p.x, p.y, r * 3.5, rgb, 0.4 * fade);
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(${light ? "40,20,70" : "30,14,48"},${0.85 * fade})`;
          ctx.beginPath();
          for (let j = 0; j < 9; j++) {
            const ang = (j / 9) * TAU;
            const rr = r * (0.75 + 0.35 * Math.sin(j * 2.7 + p.seed * 3));
            if (j === 0) ctx.moveTo(p.x + Math.cos(ang) * rr, p.y + Math.sin(ang) * rr * 0.7);
            else ctx.lineTo(p.x + Math.cos(ang) * rr, p.y + Math.sin(ang) * rr * 0.7);
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalCompositeOperation = light ? "source-over" : "lighter";
          glow(ctx, p.x - r * 0.3, p.y - r * 0.3, r * 0.7, white, 0.5 * fade, true);
        } else {
          glow(ctx, p.x, p.y, p.r * 3, rgb, 0.55 * fade);
          glow(ctx, p.x, p.y, p.r, white, 0.6 * fade, true);
        }
        break;
      case "embers": {
        // Yellow-white when fresh, cooling to orange, then deep red.
        const heat = 1 - k;
        const col = light ? look.glowLight : `255,${Math.round(90 + 140 * heat * heat)},${Math.round(40 + 120 * heat ** 3)}`;
        const flick = 0.65 + 0.35 * Math.sin(p.age * 30 + p.seed);
        glow(ctx, p.x, p.y, p.r * 4.5, col, 0.45 * fade * flick);
        glow(ctx, p.x, p.y, p.r * 1.2, light ? col : "255,240,200", 0.9 * fade * flick, true);
        break;
      }
      case "patronus":
        if (p.part === "bolt" && p.pts) {
          const a = 1 - k;
          for (const [w, alpha] of [
            [3.5, 0.25],
            [1.2, 0.95],
          ] as const) {
            ctx.strokeStyle = `rgba(${w > 2 ? rgb : white},${alpha * a})`;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(p.pts[0], p.pts[1]);
            for (let j = 2; j < p.pts.length; j += 2) ctx.lineTo(p.pts[j], p.pts[j + 1]);
            ctx.stroke();
          }
          glow(ctx, p.x, p.y, 10, rgb, 0.6 * a);
        } else {
          drawSparkle(ctx, p, rgb, white);
        }
        break;
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

/** A vine tendril that grows out of the letter in a curl, buds a leaf, then withers. */
function drawTendril(ctx: CanvasRenderingContext2D, p: Particle, rgb: string, light: boolean) {
  const k = p.age / p.life;
  const grow = Math.min(1, p.age / 0.45);
  const ease = 1 - (1 - grow) ** 3;
  const fade = k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35;
  const steps = 14;
  const len = p.r * 2.2 * ease;
  let x = p.x;
  let y = p.y;
  let ang = -Math.PI / 2 + p.a * 0.4;
  const stem = light ? "50,110,40" : "120,200,105";
  ctx.lineCap = "round";
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const nx = x + Math.cos(ang) * (len / steps);
    const ny = y + Math.sin(ang) * (len / steps);
    ctx.strokeStyle = `rgba(${stem},${0.9 * fade})`;
    ctx.lineWidth = 1.2 * (1 - t) + 0.35;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    x = nx;
    y = ny;
    // The curl tightens towards the tip.
    ang += p.a * (0.08 + t * t * p.b * 0.22);
  }
  if (grow > 0.7) {
    const s = (grow - 0.7) / 0.3;
    ctx.fillStyle = `rgba(${light ? "60,140,50" : "150,230,120"},${0.85 * fade})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 2.2 * s, 1.1 * s, ang + 0.6, 0, TAU);
    ctx.fill();
    glow(ctx, x, y, 6 * s, rgb, 0.35 * fade);
  }
}
