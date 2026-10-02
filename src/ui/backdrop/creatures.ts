// Detailed creature silhouettes: the Patronus stag and the post owls.
import type { Palette } from "./engine";
import { TAU, glow, rand } from "./engine";

// ---------------------------------------------------------------------------
// The stag, facing right, in local units (about 150 wide), origin mid-body.
// ---------------------------------------------------------------------------

/** Torso, neck and head as one smooth outline. */
const BODY = new Path2D(
  [
    "M -58 -6",
    "C -61 -18 -51 -25 -38 -23", // rump
    "C -18 -20 6 -27 28 -25", // back to withers
    "C 38 -34 47 -50 54 -63", // crest of the neck
    "C 55 -68 58 -71 61 -69", // poll
    "C 68 -65 77 -59 87 -52", // forehead to nose
    "C 89 -50 89 -46 86 -45", // muzzle tip
    "C 81 -43 75 -43 70 -45", // jaw
    "C 66 -45 63 -43 60 -39", // throat latch
    "C 57 -27 56 -10 51 3", // front of the neck
    "C 48 13 40 19 28 20", // chest
    "C 10 23 -20 23 -36 17", // belly
    "C -48 12 -57 5 -58 -6 Z", // haunch
  ].join(" "),
);

/** The ear, a small leaf behind the poll. */
const EAR = new Path2D("M 58 -66 C 54 -76 50 -82 47 -84 C 50 -78 52 -71 55 -63 Z");

/** The tail, a short upturned flick. */
const TAIL = new Path2D("M -57 -12 C -64 -18 -66 -24 -62 -28 C -61 -22 -58 -18 -54 -15 Z");

/** Antler beams and tines as polylines; width tapers from base to tip. */
const ANTLER: [number, number][][] = [
  [
    [58, -68],
    [54, -84],
    [47, -100],
    [42, -116],
    [45, -132],
  ],
  [
    [55, -80],
    [66, -90],
    [72, -98],
  ],
  [
    [49, -96],
    [61, -106],
    [67, -116],
  ],
  [
    [44, -111],
    [53, -122],
    [56, -134],
  ],
  [
    [57, -72],
    [70, -76],
  ],
];

/** Shoulder or hip positions, and whether the leg is a hind leg. */
const LEGS = [
  { x: -38, y: 6, hind: true, far: true, offset: Math.PI + 0.45 },
  { x: 34, y: 8, hind: false, far: true, offset: 0.45 },
  { x: -32, y: 9, hind: true, far: false, offset: Math.PI },
  { x: 40, y: 10, hind: false, far: false, offset: 0 },
];

/** Points inside the body, found once, where the inner light twinkles. */
let insidePoints: { x: number; y: number; p: number; r: number }[] | null = null;

function inside() {
  if (insidePoints) return insidePoints;
  const probe = document.createElement("canvas").getContext("2d")!;
  insidePoints = [];
  for (let tries = 0; tries < 4000 && insidePoints.length < 70; tries++) {
    const x = rand(-60, 88);
    const y = rand(-72, 22);
    if (probe.isPointInPath(BODY, x, y)) insidePoints.push({ x, y, p: rand(0, TAU), r: rand(0.8, 2.2) });
  }
  return insidePoints;
}

/** A tapered limb segment from (x1, y1) to (x2, y2): a band plus two round ends, each its own shape. */
function limb(pieces: Path2D[], x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const cx = Math.cos(a);
  const cy = Math.sin(a);
  const band = new Path2D();
  band.moveTo(x1 + cx * w1, y1 + cy * w1);
  band.lineTo(x2 + cx * w2, y2 + cy * w2);
  band.lineTo(x2 - cx * w2, y2 - cy * w2);
  band.lineTo(x1 - cx * w1, y1 - cy * w1);
  band.closePath();
  const end1 = new Path2D();
  end1.arc(x1, y1, w1, 0, TAU);
  const end2 = new Path2D();
  end2.arc(x2, y2, w2, 0, TAU);
  pieces.push(band, end1, end2);
}

/** Builds the legs for gallop phase `phase`: [far leg pieces, near leg pieces]. Each piece is filled on its own, so overlaps never cancel out. */
function legs(phase: number): [Path2D[], Path2D[]] {
  const far: Path2D[] = [];
  const near: Path2D[] = [];
  for (const leg of LEGS) {
    const s = Math.sin(phase + leg.offset);
    const c = Math.cos(phase + leg.offset);
    // The upper leg swings; the lower leg folds while the leg comes forward.
    const upper = leg.hind ? 0.15 + s * 0.65 : -0.1 + s * 0.75;
    const fold = Math.max(0, c) * (leg.hind ? -0.9 : 1.35);
    const ux = leg.x + Math.sin(-upper) * 24;
    const uy = leg.y + Math.cos(upper) * 24;
    const lower = upper + fold;
    const lx = ux + Math.sin(-lower) * 25;
    const ly = uy + Math.cos(lower) * 25;
    const pieces = leg.far ? far : near;
    // A muscular thigh or forearm, tapering to a slim cannon bone.
    limb(pieces, leg.x, leg.y - 4, leg.hind ? 13 : 9.5, ux, uy, 3.6);
    limb(pieces, ux, uy, 3.4, lx, ly, 2.2);
    // The hoof: a small rounded wedge at the end of the leg.
    const path = new Path2D();
    pieces.push(path);
    path.moveTo(lx - 2.6, ly - 1);
    path.quadraticCurveTo(lx + 4.5, ly - 1, lx + 3.5, ly + 4);
    path.lineTo(lx - 2.8, ly + 4);
    path.closePath();
  }
  return [far, near];
}

/** The stag is drawn as one solid silhouette offscreen, then coloured and glowed in one pass, so no seams show. */
let stagCanvas: HTMLCanvasElement | null = null;
let maskCanvas: HTMLCanvasElement | null = null;
const OX = 100; // local origin within the offscreen canvas
const OY = 150;
const BOX_W = 210;
const BOX_H = 240;

/**
 * Draws the stag at (x, y), `size` times its natural size, at gallop phase
 * `phase`. `t` (seconds) drives the twinkling inner light.
 */
export function drawStag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, phase: number, t: number, pal: Palette) {
  const silver = pal.light ? "80,100,145" : "215,232,255";
  const res = size * Math.min(window.devicePixelRatio || 1, 2);
  stagCanvas ??= document.createElement("canvas");
  maskCanvas ??= document.createElement("canvas");
  const W = Math.ceil(BOX_W * res);
  const H = Math.ceil(BOX_H * res);
  for (const c of [stagCanvas, maskCanvas]) {
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
  }
  const oc = maskCanvas.getContext("2d")!;
  const [farLegs, nearLegs] = legs(phase);
  const pitch = Math.sin(phase) * 0.05;

  // 1. The silhouette in solid white: far legs at half strength, then everything else.
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.globalCompositeOperation = "source-over";
  oc.clearRect(0, 0, W, H);
  oc.setTransform(res, 0, 0, res, OX * res, OY * res);
  oc.rotate(pitch);
  oc.fillStyle = "#fff";
  oc.globalAlpha = 0.5;
  for (const piece of farLegs) oc.fill(piece);
  oc.globalAlpha = 1;
  for (const part of [BODY, EAR, TAIL, ...nearLegs]) oc.fill(part);
  oc.strokeStyle = "#fff";
  oc.lineCap = "round";
  oc.lineJoin = "round";
  for (const [i, line] of ANTLER.entries()) {
    for (let k = 1; k < line.length; k++) {
      oc.lineWidth = (i === 0 ? 4.2 : 2.8) * (1 - (k - 1) / line.length) + 0.7;
      oc.beginPath();
      oc.moveTo(line[k - 1][0], line[k - 1][1]);
      oc.lineTo(line[k][0], line[k][1]);
      oc.stroke();
    }
  }
  // 2. Colour a copy of it: brighter along the back and antlers, fading towards the hooves.
  const mask = maskCanvas;
  const cc = stagCanvas.getContext("2d")!;
  cc.setTransform(1, 0, 0, 1, 0, 0);
  cc.globalCompositeOperation = "source-over";
  cc.clearRect(0, 0, W, H);
  cc.drawImage(mask, 0, 0);
  cc.setTransform(res, 0, 0, res, OX * res, OY * res);
  cc.globalCompositeOperation = "source-in";
  const shade = cc.createLinearGradient(0, -140, 0, 75);
  shade.addColorStop(0, `rgba(${silver},${pal.light ? 0.7 : 0.62})`);
  shade.addColorStop(0.45, `rgba(${silver},${pal.light ? 0.38 : 0.3})`);
  shade.addColorStop(0.7, `rgba(${silver},${pal.light ? 0.26 : 0.2})`);
  shade.addColorStop(1, `rgba(${silver},${pal.light ? 0.12 : 0.08})`);
  cc.fillStyle = shade;
  cc.fillRect(-OX, -OY, BOX_W, BOX_H);
  cc.globalCompositeOperation = "source-over";

  // 3. Onto the screen: an aura, a blurred glow pass, then the crisp silhouette.
  ctx.save();
  ctx.translate(x, y + Math.cos(phase * 2) * 3 * size);
  ctx.scale(size, size);
  glow(ctx, 10, -30, 160, silver, pal.light ? 0.08 : 0.14);
  // A soft halo: the solid silhouette, blurred and faint, under the coloured one.
  if (!pal.light && "filter" in ctx) {
    ctx.filter = `blur(${Math.round(9 * size)}px)`;
    ctx.globalAlpha = 0.32;
    ctx.drawImage(mask, -OX, -OY, BOX_W, BOX_H);
    ctx.filter = `blur(${Math.max(1, Math.round(2 * size))}px)`;
    ctx.globalAlpha = 0.28;
    ctx.drawImage(mask, -OX, -OY, BOX_W, BOX_H);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(stagCanvas, -OX, -OY, BOX_W, BOX_H);

  // 4. The eye, and light twinkling inside the body.
  ctx.rotate(pitch);
  glow(ctx, 75, -54, 3.2, pal.light ? "40,60,100" : "255,255,255", 0.95, true);
  for (const pt of inside()) {
    const a = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2.2 + pt.p)) ** 3;
    glow(ctx, pt.x, pt.y, pt.r * 2.4, silver, (pal.light ? 0.35 : 0.55) * a, true);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Owls, gliding with slow wingbeats.
// ---------------------------------------------------------------------------

/** One wing, drawn along +x from the shoulder: a curved leading edge, finger-like primaries, a scalloped trailing edge (+y). */
function wing(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.bezierCurveTo(10, -7, 24, -7, 36, -3);
  // Primaries: four finger-like feathers at the tip.
  for (let i = 0; i < 4; i++) {
    const fx = 36 - i * 4.5;
    const fy = -3 + i * 3.2;
    ctx.quadraticCurveTo(fx + 5, fy + 3, fx - 1, fy + 4);
  }
  // Secondaries: a scalloped trailing edge back to the shoulder.
  for (let i = 0; i < 4; i++) {
    const fx = 20 - i * 5;
    const fy = 10 - i * 1.6;
    ctx.quadraticCurveTo(fx + 1, fy + 3, fx - 4, fy);
  }
  ctx.closePath();
  ctx.fill();
}

/** Points the wing for stroke position `lift` (1 = top of the upstroke, -1 = bottom of the downstroke), as seen from the side. */
function placeWing(ctx: CanvasRenderingContext2D, lift: number) {
  const angle = Math.PI + (Math.PI / 2 - 0.35) * lift;
  ctx.rotate(angle);
  // Mid-stroke, the wing points at the viewer and looks shorter.
  ctx.scale(0.45 + 0.55 * Math.abs(lift), lift >= 0 ? -1 : 1);
}

/** An owl flying right at (x, y), `size` times natural size, wing phase `beat`. */
export function drawOwl(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, beat: number, ink: string, letter: string) {
  // Quick downstrokes, then a glide with the wings held level and back.
  const lift = Math.sin(beat);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  // Far wing, behind the body and dimmer.
  ctx.fillStyle = `${ink}0.3)`;
  ctx.save();
  ctx.translate(6, -6);
  placeWing(ctx, lift);
  wing(ctx);
  ctx.restore();
  // Body: a rounded teardrop, with a short tail fan.
  ctx.fillStyle = `${ink}0.55)`;
  ctx.beginPath();
  ctx.moveTo(-22, 2);
  ctx.bezierCurveTo(-16, -9, 4, -11, 12, -6);
  ctx.bezierCurveTo(16, -2, 14, 6, 6, 8);
  ctx.bezierCurveTo(-6, 10, -16, 8, -22, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(-30, -3);
  ctx.lineTo(-31, 4);
  ctx.lineTo(-21, 5);
  ctx.fill();
  // Head with ear tufts, and a pale facial disc.
  ctx.beginPath();
  ctx.arc(14, -7, 7.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -13);
  ctx.lineTo(9, -19);
  ctx.lineTo(14, -14);
  ctx.moveTo(16, -14);
  ctx.lineTo(19, -19);
  ctx.lineTo(20, -12);
  ctx.fill();
  ctx.fillStyle = `${ink}0.3)`;
  ctx.beginPath();
  ctx.ellipse(17, -6, 4, 5, 0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,210,90,0.85)";
  ctx.beginPath();
  ctx.arc(18.5, -7, 1.3, 0, TAU);
  ctx.fill();
  // Near wing, over the body.
  ctx.fillStyle = `${ink}0.5)`;
  ctx.save();
  ctx.translate(2, -4);
  placeWing(ctx, lift);
  wing(ctx);
  ctx.restore();
  // The letter, held in the talons.
  ctx.fillStyle = letter;
  ctx.save();
  ctx.translate(-2, 11);
  ctx.rotate(-0.15);
  ctx.fillRect(-6, 0, 12, 8);
  ctx.strokeStyle = "rgba(120,60,40,0.6)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(0, 4.5);
  ctx.lineTo(6, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(170,40,40,0.8)";
  ctx.beginPath();
  ctx.arc(0, 4.5, 1.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}
