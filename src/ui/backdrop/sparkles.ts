// Twinkling sparkles, shared by the Patronus backdrop and the Elder Wand's
// typing effect.
import { glow } from "./engine";

export interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  r: number;
  /** Twinkle speed and offset. */
  rate: number;
  seed: number;
}

/** Move a sparkle on by dt: it slows as it drifts, and settles gently like falling dust. */
export function moveSparkle(p: Sparkle, dt: number) {
  const drag = Math.exp(-dt * 1.6);
  p.vx *= drag;
  p.vy = p.vy * drag + 4 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

/** Draw one sparkle: a coloured halo, a bright core, and a four-pointed glint on the larger ones. */
export function drawSparkle(ctx: CanvasRenderingContext2D, p: Sparkle, rgb: string, core = "255,255,255") {
  const k = p.age / p.life;
  const fade = Math.min(1, p.age / 0.08) * (1 - k) ** 1.2;
  const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(p.age * p.rate + p.seed));
  const a = fade * twinkle;
  glow(ctx, p.x, p.y, p.r * 4.5, rgb, 0.22 * a);
  glow(ctx, p.x, p.y, p.r * 1.6, core, 0.95 * a, true);
  if (p.r > 1.7 && twinkle > 0.8) {
    const len = p.r * 5 * twinkle;
    ctx.strokeStyle = `rgba(${core},${0.55 * a})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(p.x - len, p.y);
    ctx.lineTo(p.x + len, p.y);
    ctx.moveTo(p.x, p.y - len);
    ctx.lineTo(p.x, p.y + len);
    ctx.stroke();
  }
}

/** Update and draw a list of sparkles; dead ones are removed. */
export function stepSparkles(ctx: CanvasRenderingContext2D, list: Sparkle[], dt: number, rgb: string) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.age += dt;
    if (p.age >= p.life) {
      list.splice(i, 1);
      continue;
    }
    moveSparkle(p, dt);
    drawSparkle(ctx, p, rgb);
  }
}
