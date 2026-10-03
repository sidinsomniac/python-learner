// The wand itself: a tapered shaft, a carved handle and a glowing tip, held
// above the cursor and pointing down at the letter being written.
import { glow } from "../backdrop/engine";
import type { WandLook } from "./effects";

export const WAND_LENGTH = 92;
/** Resting tilt: the handle leans up and to the right, about 35 degrees from upright. */
export const WAND_TILT = 0.62;

/** Where the handle end is, for a tip at (x, y) tilted by `angle` from upright. */
export function wandAxis(angle: number) {
  return { dx: Math.sin(angle), dy: -Math.cos(angle) };
}

/**
 * Draw the wand with its tip at (x, y). `angle` is its tilt (radians from
 * upright, positive leaning right), `alpha` its fade, `glowing` how bright the
 * tip is (it flares on each keystroke), and `t` the time, for the tip's pulse.
 */
export function drawWand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  alpha: number,
  glowing: number,
  t: number,
  look: WandLook,
  light: boolean,
) {
  if (alpha <= 0.01) return;
  const { dx, dy } = wandAxis(angle);
  // Perpendicular, for the shaft's width.
  const px = -dy;
  const py = dx;
  const at = (s: number, w: number) => ({ x: x + dx * s + px * w, y: y + dy * s + py * w });

  ctx.save();
  ctx.globalAlpha = alpha;
  // A soft shadow below the wand lifts it off the page.
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Shaft: tapers from 1px at the tip to about 3.4px at the handle.
  const L = WAND_LENGTH;
  const handleAt = L * 0.66;
  const wobble = (s: number) => (look.shape === "twisted" ? Math.sin(s * 0.35) * 0.9 : 0);
  ctx.beginPath();
  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let s = 0; s <= handleAt; s += 3) {
    const w = 0.8 + (s / handleAt) * 2;
    left.push(at(s, w + wobble(s)));
    right.push(at(s, -w + wobble(s)));
  }
  ctx.moveTo(left[0].x, left[0].y);
  for (const p of left) ctx.lineTo(p.x, p.y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  const g = ctx.createLinearGradient(at(0, 3).x, at(0, 3).y, at(0, -3).x, at(0, -3).y);
  g.addColorStop(0, look.wood);
  g.addColorStop(0.45, lighten(look.wood, 0.35));
  g.addColorStop(1, look.wood);
  ctx.fillStyle = g;
  ctx.fill();

  // Handle: thicker, darker, with a pommel.
  ctx.beginPath();
  const h0 = at(handleAt, 3.1);
  ctx.moveTo(h0.x, h0.y);
  const h1 = at(L, 3.5);
  const h2 = at(L + 3, 0);
  const h3 = at(L, -3.5);
  const h4 = at(handleAt, -3.1);
  ctx.lineTo(h1.x, h1.y);
  ctx.quadraticCurveTo(at(L + 4, 2.4).x, at(L + 4, 2.4).y, h2.x, h2.y);
  ctx.quadraticCurveTo(at(L + 4, -2.4).x, at(L + 4, -2.4).y, h3.x, h3.y);
  ctx.lineTo(h4.x, h4.y);
  ctx.closePath();
  ctx.fillStyle = look.handle;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Carved rings on the handle (and the Elder Wand's knots along the shaft).
  ctx.strokeStyle = lighten(look.handle, 0.4);
  ctx.lineWidth = 0.8;
  for (const s of [handleAt + 2, handleAt + 5, L - 3]) {
    const a = at(s, 3.3);
    const b = at(s, -3.3);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  if (look.shape === "knobbly") {
    ctx.fillStyle = lighten(look.wood, 0.15);
    for (const s of [17, 33, 48]) {
      const k = at(s, 0);
      ctx.beginPath();
      ctx.ellipse(k.x, k.y, 2.6, 1.8, Math.atan2(dy, dx), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // The tip's light: a steady pulse that flares on each keystroke.
  const rgb = light ? look.glowLight : look.glow;
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  ctx.globalCompositeOperation = light ? "source-over" : "lighter";
  glow(ctx, x, y, 10 + 8 * glowing, rgb, alpha * (0.35 + 0.4 * glowing) * pulse);
  glow(ctx, x, y, 2.5 + 1.5 * glowing, light ? rgb : "255,255,255", alpha * (0.7 + 0.3 * glowing), true);
  ctx.globalCompositeOperation = "source-over";
}

/** Mix a "#rrggbb" colour towards white by `k` (0 to 1). */
export function lighten(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}
