// Detailed creatures for the living backgrounds: the Patronus stag and the post owls.
import type { Palette } from "./engine";
import { TAU, clamp, glow, rand } from "./engine";

const ease = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const frac = (v: number) => v - Math.floor(v);

// ===========================================================================
// The Patronus stag. Local units, facing right, origin mid-body (about 150 wide).
// ===========================================================================

/** Barrel, rump and chest. */
const TORSO = new Path2D(
  [
    "M -51 -8",
    "C -53 -17 -46 -23 -35 -22", // rump
    "C -16 -20 6 -27 28 -25", // back to withers
    "C 36 -25 44 -18 50 -8", // base of the neck
    "C 53 2 46 14 28 20", // chest
    "C 10 23 -16 22 -30 16", // belly
    "C -41 11 -50 4 -51 -8 Z", // haunch
  ].join(" "),
);

/** Neck and head, drawn separately so they can nod. They pivot at NECK_PIVOT. */
const NECK_HEAD = new Path2D(
  [
    "M 22 -22",
    "C 34 -30 46 -48 54 -63", // crest of the neck
    "C 55 -68 58 -71 61 -69", // poll
    "C 68 -65 77 -59 87 -52", // forehead to nose
    "C 89 -50 89 -46 86 -45", // muzzle tip
    "C 81 -43 75 -43 70 -45", // jaw
    "C 66 -45 63 -43 60 -39", // throat latch
    "C 57 -27 56 -10 50 2", // front of the neck
    "C 44 4 34 -2 22 -22 Z",
  ].join(" "),
);
const NECK_PIVOT = { x: 38, y: -14 };

const EAR = new Path2D("M 58 -66 C 54 -76 50 -82 47 -84 C 50 -78 52 -71 55 -63 Z");

/** The tail, a short upturned flick, pivoting at its root. */
const TAIL = new Path2D("M -49 -15 C -56 -21 -58 -27 -54 -31 C -53 -25 -50 -21 -46 -18 Z");
const TAIL_PIVOT = { x: -49, y: -15 };

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

/**
 * Legs, in rotary-gallop footfall order: far hind, near hind, far fore, near
 * fore. `offset` is where each leg is in the stride cycle.
 */
const LEGS = [
  { x: -32, y: 3, hind: true, far: true, offset: 0 },
  { x: -27, y: 6, hind: true, far: false, offset: 0.1 },
  { x: 34, y: 6, hind: false, far: true, offset: 0.48 },
  { x: 40, y: 9, hind: false, far: false, offset: 0.58 },
];
/** Fraction of the stride a hoof spends on the ground. */
const STANCE = 0.42;

/** Points inside the torso, found once, where the inner light twinkles. */
let insidePoints: { x: number; y: number; p: number; r: number }[] | null = null;

function inside() {
  if (insidePoints) return insidePoints;
  const probe = document.createElement("canvas").getContext("2d")!;
  insidePoints = [];
  for (let tries = 0; tries < 5000 && insidePoints.length < 80; tries++) {
    const x = rand(-54, 88);
    const y = rand(-72, 22);
    if (probe.isPointInPath(TORSO, x, y) || probe.isPointInPath(NECK_HEAD, x, y)) insidePoints.push({ x, y, p: rand(0, TAU), r: rand(0.8, 2.2) });
  }
  return insidePoints;
}

/** A tapered limb segment from (x1, y1) to (x2, y2): a band plus two round ends, each its own shape so overlaps never cancel out. */
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

/** Walk down a chain of bones; angles are measured from straight down, positive swinging forward. */
function chain(x: number, y: number, bones: [number, number][]) {
  const pts: [number, number][] = [[x, y]];
  for (const [len, angle] of bones) {
    x += Math.sin(angle) * len;
    y += Math.cos(angle) * len;
    pts.push([x, y]);
  }
  return pts;
}

interface Hoof {
  /** Hoof position in stag-local units. */
  x: number;
  y: number;
  /** Where the leg is in its stride, 0 to 1 (0 = touching down). */
  u: number;
  far: boolean;
}

/** Builds the legs for stride phase `phase` (0 to 1 is one stride). */
function legs(phase: number): { far: Path2D[]; near: Path2D[]; hooves: Hoof[] } {
  const far: Path2D[] = [];
  const near: Path2D[] = [];
  const hooves: Hoof[] = [];
  for (const leg of LEGS) {
    const u = frac(phase + leg.offset);
    // On the ground the leg sweeps back, straight; in the air it swings forward, folded.
    let swing: number;
    let fold: number;
    if (u < STANCE) {
      swing = lerp(0.42, -0.5, u / STANCE);
      fold = 0;
    } else {
      const v = (u - STANCE) / (1 - STANCE);
      swing = lerp(-0.5, 0.42, ease(v));
      fold = Math.sin(v * Math.PI);
    }
    let pts: [number, number][];
    if (leg.hind) {
      // Thigh down and forward, gaskin back to the hock, cannon down to the hoof.
      pts = chain(leg.x, leg.y, [
        [22, swing * 0.7 + 0.45 + fold * 0.35],
        [23, swing * 0.8 - 0.6 - fold * 0.5],
        [19, swing + fold * 0.95],
      ]);
      const pieces = leg.far ? far : near;
      limb(pieces, pts[0][0] + 2, pts[0][1] - 5, 11, pts[1][0], pts[1][1], 5.6);
      limb(pieces, pts[1][0], pts[1][1], 5.6, pts[2][0], pts[2][1], 3.2);
      limb(pieces, pts[2][0], pts[2][1], 3, pts[3][0], pts[3][1], 2.2);
    } else {
      // Upper arm sloping back, forearm to the knee, cannon to the hoof; the knee folds in the air.
      pts = chain(leg.x, leg.y, [
        [17, swing * 0.5 - 0.3 + fold * 0.3],
        [21, swing + fold * 0.55],
        [18, swing - fold * 1.9],
      ]);
      const pieces = leg.far ? far : near;
      limb(pieces, pts[0][0], pts[0][1] - 5, 10, pts[1][0], pts[1][1], 5.4);
      limb(pieces, pts[1][0], pts[1][1], 4.6, pts[2][0], pts[2][1], 3.1);
      limb(pieces, pts[2][0], pts[2][1], 2.9, pts[3][0], pts[3][1], 2.2);
    }
    const [hx, hy] = pts[3];
    const hoof = new Path2D();
    hoof.moveTo(hx - 2.6, hy - 1);
    hoof.quadraticCurveTo(hx + 4.5, hy - 1, hx + 3.6, hy + 4);
    hoof.lineTo(hx - 2.8, hy + 4);
    hoof.closePath();
    (leg.far ? far : near).push(hoof);
    hooves.push({ x: hx, y: hy + 4, u, far: leg.far });
  }
  return { far, near, hooves };
}

// The stag is drawn as one solid silhouette offscreen (the mask), then a
// coloured copy is made, so no seams show between body parts.
let stagCanvas: HTMLCanvasElement | null = null;
let maskCanvas: HTMLCanvasElement | null = null;
const OX = 100; // local origin within the offscreen canvases
const OY = 150;
const BOX_W = 215;
const BOX_H = 245;

/**
 * Draws the stag at (x, y), `size` times its natural size, facing `dir` (1 =
 * right, -1 = left), at stride phase `phase` (one stride per 1.0). `t`
 * (seconds) drives the shimmer and the inner light. Returns the hooves in
 * screen coordinates, so the caller can leave hoofprints of light.
 */
export function drawStag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: number, phase: number, t: number, pal: Palette) {
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
  const cycle = phase * TAU;
  const { far, near, hooves } = legs(phase);
  // The spine rocks with the gallop; the neck nods against it; the tail flicks.
  const pitch = Math.sin(cycle) * 0.06;
  const nod = -pitch * 1.4 + Math.sin(cycle * 2 + 0.6) * 0.035;
  const flick = Math.sin(cycle * 2) * 0.18;

  // 1. The silhouette in solid white.
  const oc = maskCanvas.getContext("2d")!;
  oc.setTransform(1, 0, 0, 1, 0, 0);
  oc.globalCompositeOperation = "source-over";
  oc.clearRect(0, 0, W, H);
  oc.setTransform(res, 0, 0, res, OX * res, OY * res);
  oc.rotate(pitch);
  oc.fillStyle = "#fff";
  oc.strokeStyle = "#fff";
  oc.globalAlpha = 0.5;
  for (const piece of far) oc.fill(piece);
  oc.globalAlpha = 1;
  oc.fill(TORSO);
  for (const piece of near) oc.fill(piece);
  oc.save();
  oc.translate(TAIL_PIVOT.x, TAIL_PIVOT.y);
  oc.rotate(flick);
  oc.translate(-TAIL_PIVOT.x, -TAIL_PIVOT.y);
  oc.fill(TAIL);
  oc.restore();
  oc.save();
  oc.translate(NECK_PIVOT.x, NECK_PIVOT.y);
  oc.rotate(nod);
  oc.translate(-NECK_PIVOT.x, -NECK_PIVOT.y);
  oc.fill(NECK_HEAD);
  oc.fill(EAR);
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
  oc.restore();

  // 2. Colour a copy: brighter along the back and antlers, fading towards the
  // hooves, with a band of light sweeping across it.
  const cc = stagCanvas.getContext("2d")!;
  cc.setTransform(1, 0, 0, 1, 0, 0);
  cc.globalCompositeOperation = "source-over";
  cc.clearRect(0, 0, W, H);
  cc.drawImage(maskCanvas, 0, 0);
  cc.setTransform(res, 0, 0, res, OX * res, OY * res);
  cc.globalCompositeOperation = "source-in";
  const shade = cc.createLinearGradient(0, -140, 0, 80);
  shade.addColorStop(0, `rgba(${silver},${pal.light ? 0.66 : 0.5})`);
  shade.addColorStop(0.45, `rgba(${silver},${pal.light ? 0.36 : 0.24})`);
  shade.addColorStop(0.72, `rgba(${silver},${pal.light ? 0.24 : 0.15})`);
  shade.addColorStop(1, `rgba(${silver},${pal.light ? 0.1 : 0.05})`);
  cc.fillStyle = shade;
  cc.fillRect(-OX, -OY, BOX_W, BOX_H);
  cc.globalCompositeOperation = "source-atop";
  const sweepX = lerp(-170, 170, frac(t / 3.2));
  const sweep = cc.createLinearGradient(sweepX - 40, -60, sweepX + 40, 60);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.5, `rgba(255,255,255,${pal.light ? 0.1 : 0.15})`);
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  cc.fillStyle = sweep;
  cc.fillRect(-OX, -OY, BOX_W, BOX_H);
  cc.globalCompositeOperation = "source-over";

  // 3. Onto the screen: aura, a blurred halo, then the stag.
  const bob = -Math.abs(Math.cos(cycle)) * 4 + 2;
  ctx.save();
  ctx.translate(x, y + bob * size);
  ctx.scale(size * dir, size);
  glow(ctx, 10, -30, 165, silver, pal.light ? 0.08 : 0.14);
  // Motion blur: soft, blurred smears of the silhouette, stretching back along its path.
  if (!pal.light && "filter" in ctx) {
    ctx.filter = `blur(${Math.round(5 * size)}px)`;
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = 0.11 * (1 - i / 5);
      ctx.drawImage(maskCanvas, -OX - i * 10, -OY + i * 0.6, BOX_W, BOX_H);
    }
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }
  if (!pal.light && "filter" in ctx) {
    ctx.filter = `blur(${Math.round(9 * size)}px)`;
    ctx.globalAlpha = 0.26;
    ctx.drawImage(maskCanvas, -OX, -OY, BOX_W, BOX_H);
    ctx.filter = `blur(${Math.max(1, Math.round(2 * size))}px)`;
    ctx.globalAlpha = 0.2;
    ctx.drawImage(maskCanvas, -OX, -OY, BOX_W, BOX_H);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(stagCanvas, -OX, -OY, BOX_W, BOX_H);

  // 4. The eye, and light twinkling inside the body.
  ctx.rotate(pitch);
  ctx.save();
  ctx.translate(NECK_PIVOT.x, NECK_PIVOT.y);
  ctx.rotate(nod);
  ctx.translate(-NECK_PIVOT.x, -NECK_PIVOT.y);
  glow(ctx, 75, -54, 3.4, pal.light ? "40,60,100" : "255,255,255", 0.95, true);
  ctx.restore();
  for (const pt of inside()) {
    const a = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2.2 + pt.p)) ** 3;
    glow(ctx, pt.x, pt.y, pt.r * 2.4, silver, (pal.light ? 0.35 : 0.5) * a, true);
  }
  ctx.restore();

  // Hooves and trail emitters, in screen coordinates.
  const cos = Math.cos(pitch);
  const sin = Math.sin(pitch);
  const toScreen = (lx: number, ly: number, onHead = false) => {
    if (onHead) {
      const dx = lx - NECK_PIVOT.x;
      const dy = ly - NECK_PIVOT.y;
      lx = NECK_PIVOT.x + dx * Math.cos(nod) - dy * Math.sin(nod);
      ly = NECK_PIVOT.y + dx * Math.sin(nod) + dy * Math.cos(nod);
    }
    return { x: x + (lx * cos - ly * sin) * size * dir, y: y + bob * size + (lx * sin + ly * cos) * size };
  };
  return {
    hooves: hooves.map((h) => ({ ...toScreen(h.x, h.y), u: h.u, far: h.far })),
    /** Where the trail streams from: the antler tip (a streak of light), then the back, rump and belly (smoke). */
    emitters: [toScreen(45, -132, true), toScreen(6, -24), toScreen(-44, -16), toScreen(-8, 18)],
  };
}

// ===========================================================================
// Owls: Hedwig-style snowy owls (tawny owls on the light theme), facing right
// in local units, origin mid-body (about 45 long, wingspan about 110).
// ===========================================================================

export interface Owl {
  x: number;
  y: number;
  /** 1 = flying right, -1 = flying left. */
  dir: number;
  /** Closer owls are bigger, faster and more solid. */
  depth: number;
  size: number;
  speed: number;
  /** Wingbeat phase, and the current stroke position (1 = wings up, -1 = down). */
  beat: number;
  stroke: number;
  /** Beating or gliding, and for how much longer. */
  gliding: boolean;
  timer: number;
  beatsLeft: number;
  /** How the wrist is bent: positive while the wing comes up (the hand trails). */
  wrist: number;
  bob: number;
  pitch: number;
  letter: boolean;
  /** Fixed speckle pattern on this owl's plumage. */
  spots: [number, number, number][];
}

export function makeOwl(w: number, h: number): Owl {
  const depth = rand(0, 1);
  const dir = Math.random() < 0.75 ? 1 : -1;
  return {
    x: dir > 0 ? rand(-w * 0.6, w) : rand(0, w * 1.6),
    y: rand(h * 0.1, h * 0.55),
    dir,
    depth,
    size: 0.85 + depth * 0.75,
    speed: 45 + depth * 55,
    beat: rand(0, TAU),
    stroke: 0,
    gliding: Math.random() < 0.4,
    timer: rand(0.5, 2),
    beatsLeft: Math.floor(rand(2, 5)),
    wrist: 0,
    bob: 0,
    pitch: 0,
    letter: Math.random() < 0.7,
    spots: Array.from({ length: 16 }, () => [rand(-16, 10), rand(-11, 4), rand(0.8, 1.6)]),
  };
}

/** Advances an owl: a few strong wingbeats, then a glide on outstretched wings. */
export function stepOwl(o: Owl, dt: number, w: number, h: number) {
  if (o.gliding) {
    o.timer -= dt;
    o.stroke += (0.28 - o.stroke) * Math.min(1, dt * 3);
    o.wrist += (-0.12 - o.wrist) * Math.min(1, dt * 3);
    o.bob += (0 - o.bob) * Math.min(1, dt * 3);
    o.pitch += (0.06 - o.pitch) * Math.min(1, dt * 2);
    o.y += 9 * dt; // a glide slowly loses height
    if (o.timer <= 0) {
      o.gliding = false;
      o.beatsLeft = Math.floor(rand(2, 5));
      o.beat = Math.asin(clamp(o.stroke, -1, 1));
    }
  } else {
    // The downstroke (wings coming down) is quicker than the recovery.
    const down = Math.cos(o.beat) < 0;
    const before = o.beat;
    o.beat += dt * TAU * 2.1 * (down ? 1.35 : 0.8);
    if (Math.floor(o.beat / TAU) > Math.floor(before / TAU)) o.beatsLeft -= 1;
    o.stroke = Math.sin(o.beat);
    o.wrist = Math.cos(o.beat) * 0.55;
    o.bob = o.stroke * 2.6;
    o.pitch = -Math.cos(o.beat) * 0.05;
    o.y -= 7 * dt; // flapping climbs
    if (o.beatsLeft <= 0 && o.stroke > 0.15 && Math.cos(o.beat) > 0) {
      o.gliding = true;
      o.timer = rand(1, 2.4);
    }
  }
  o.y = clamp(o.y, h * 0.06, h * 0.62);
  o.x += o.speed * o.dir * dt;
  const margin = 90 * o.size;
  if ((o.dir > 0 && o.x > w + margin) || (o.dir < 0 && o.x < -margin)) {
    o.x = o.dir > 0 ? -margin : w + margin;
    o.y = rand(h * 0.1, h * 0.55);
  }
}

interface Plumage {
  light: string;
  mid: string;
  dark: string;
  edge: string;
  spot: string;
  face: string;
}

const SNOWY: Plumage = {
  light: "247,248,252",
  mid: "222,227,238",
  dark: "180,188,205",
  edge: "120,130,155",
  spot: "60,66,84",
  face: "255,255,255",
};
const TAWNY: Plumage = {
  light: "200,160,112",
  mid: "170,126,80",
  dark: "128,88,52",
  edge: "80,52,30",
  spot: "70,45,25",
  face: "222,192,150",
};

/** One feather: a rounded vane along +x from its base, with a central shaft. */
function feather(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number, width: number, fill: string, edge: string, barred: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -width * 0.45);
  ctx.bezierCurveTo(len * 0.45, -width * 0.62, len * 0.92, -width * 0.42, len, 0);
  ctx.bezierCurveTo(len * 0.9, width * 0.48, len * 0.4, width * 0.6, 0, width * 0.45);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len * 0.85, 0);
  ctx.stroke();
  if (barred) {
    ctx.lineWidth = 0.9;
    for (const at of [0.55, 0.78]) {
      ctx.beginPath();
      ctx.moveTo(len * at, -width * 0.38);
      ctx.lineTo(len * (at + 0.04), width * 0.38);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * One wing from the shoulder (sx, sy). `stroke` is 1 at the top of the
 * upstroke and -1 at the bottom of the downstroke; `wrist` bends the hand.
 */
function drawWing(ctx: CanvasRenderingContext2D, sx: number, sy: number, stroke: number, wrist: number, c: Plumage, shadow: number) {
  // From pointing back and a little down (bottom of the stroke) to up and a little back (top).
  const arm = lerp(Math.PI - 0.4, Math.PI * 1.5 - 0.22, (stroke + 1) / 2);
  const hand = arm - wrist;
  // Mid-stroke the wing points towards the viewer, so it looks shorter.
  const reach = 0.55 + 0.45 * Math.abs(stroke);
  const ax = Math.cos(arm);
  const ay = Math.sin(arm);
  const wx = sx + ax * 17 * reach;
  const wy = sy + ay * 17 * reach;
  const hx = Math.cos(hand);
  const hy = Math.sin(hand);
  const tx = wx + hx * 19 * reach;
  const ty = wy + hy * 19 * reach;
  const tone = (rgb: string, a: number) => {
    const [r, g, b] = rgb.split(",").map(Number);
    return `rgba(${Math.round(r * shadow)},${Math.round(g * shadow)},${Math.round(b * shadow)},${a})`;
  };
  const edge = tone(c.edge, 0.4);
  const fl = Math.sqrt(reach);
  const nx = Math.cos(arm - Math.PI / 2);
  const ny = Math.sin(arm - Math.PI / 2);
  const hnx = Math.cos(hand - Math.PI / 2);
  const hny = Math.sin(hand - Math.PI / 2);
  // Primaries: seven long flight feathers fanning from the hand, overlapping,
  // the outermost longest, splaying into "fingers" at the very tip.
  for (let k = 6; k >= 0; k--) {
    const at = 0.1 + (k / 6) * 0.9;
    const bx = lerp(wx, tx, at);
    const by = lerp(wy, ty, at);
    const angle = hand - (Math.PI / 2) * (1 - (k + 1) / 7.6);
    feather(ctx, bx, by, angle, (15 + k * 2.1) * fl, 7.5, tone(k > 4 ? c.mid : c.light, 1), edge, k > 3);
  }
  // Secondaries: eight broad feathers along the arm, overlapping into a smooth trailing edge.
  for (let i = 0; i < 8; i++) {
    const at = (i + 0.5) / 8;
    const bx = lerp(sx, wx, at);
    const by = lerp(sy, wy, at);
    feather(ctx, bx, by, arm - Math.PI / 2 + 0.22 * at, (14 - Math.abs(i - 4) * 0.5) * fl, 8.5, tone(i % 2 ? c.mid : c.light, 1), edge, false);
  }
  // Greater coverts: a row of rounded feathers over the bases of the flight feathers.
  for (let i = 0; i < 9; i++) {
    const at = i / 8;
    const onHand = at > 0.62;
    const bx = onHand ? lerp(wx, tx, (at - 0.62) * 1.2) : lerp(sx, wx, at / 0.62);
    const by = onHand ? lerp(wy, ty, (at - 0.62) * 1.2) : lerp(sy, wy, at / 0.62);
    const angle = (onHand ? hand : arm) - Math.PI / 2 + 0.3;
    feather(ctx, bx - (onHand ? hnx : nx) * 2, by - (onHand ? hny : ny) * 2, angle, 8 * fl, 7, tone(c.light, 1), edge, false);
  }
  // Lesser coverts: the soft, rounded leading edge of the wing.
  ctx.beginPath();
  ctx.moveTo(sx - nx * 3.5, sy - ny * 3.5);
  ctx.quadraticCurveTo(lerp(sx, wx, 0.5) - nx * 5, lerp(sy, wy, 0.5) - ny * 5, wx - nx * 3.5, wy - ny * 3.5);
  ctx.quadraticCurveTo(lerp(wx, tx, 0.3) - hnx * 2.5, lerp(wy, ty, 0.3) - hny * 2.5, lerp(wx, tx, 0.42), lerp(wy, ty, 0.42));
  ctx.quadraticCurveTo(lerp(wx, tx, 0.2) + hnx * 3, lerp(wy, ty, 0.2) + hny * 3, wx + nx * 3, wy + ny * 3);
  ctx.quadraticCurveTo(lerp(sx, wx, 0.5) + nx * 4, lerp(sy, wy, 0.5) + ny * 4, sx + nx * 3, sy + ny * 3);
  ctx.closePath();
  ctx.fillStyle = tone(c.light, 1);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 0.4;
  ctx.stroke();
}

/** Draws an owl. `ink` themes it: snowy on dark backgrounds, tawny on light ones. */
export function drawOwl(ctx: CanvasRenderingContext2D, o: Owl, pal: Palette) {
  const c = pal.light ? TAWNY : SNOWY;
  ctx.save();
  ctx.translate(o.x, o.y + o.bob * o.size);
  ctx.scale(o.size * o.dir, o.size);
  ctx.rotate(o.pitch);
  ctx.globalAlpha = 0.55 + o.depth * 0.4;

  // Far wing first, in shadow, slightly higher and further back.
  drawWing(ctx, 5, -9, o.stroke, o.wrist, c, 0.78);

  // Tail: a short fan of feathers.
  for (let i = 0; i < 5; i++) feather(ctx, -17, 1, Math.PI + 0.15 + (i - 2) * 0.13, 13, 5, `rgb(${c.mid})`, `rgba(${c.edge},0.55)`, i % 2 === 0);

  // Body: plump, darker along the back, pale on the breast.
  ctx.beginPath();
  ctx.moveTo(17, -2);
  ctx.bezierCurveTo(17, -13, 4, -15, -6, -12);
  ctx.bezierCurveTo(-14, -10, -20, -5, -22, 0);
  ctx.bezierCurveTo(-16, 6, -6, 12, 4, 11);
  ctx.bezierCurveTo(12, 10, 18, 6, 17, -2);
  ctx.closePath();
  const body = ctx.createLinearGradient(0, -14, 0, 12);
  body.addColorStop(0, `rgb(${c.mid})`);
  body.addColorStop(0.55, `rgb(${c.light})`);
  body.addColorStop(1, `rgb(${c.light})`);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = `rgba(${c.edge},0.5)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Speckles across the back.
  ctx.fillStyle = `rgba(${c.spot},0.45)`;
  for (const [sx, sy, r] of o.spots) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 1.4, r * 0.7, 0.3, 0, TAU);
    ctx.fill();
  }

  // Feathered feet, tucked up, holding the letter.
  if (o.letter) {
    ctx.save();
    ctx.translate(4, 13);
    ctx.rotate(-0.12);
    ctx.fillStyle = pal.light ? "rgb(245,236,214)" : "rgb(250,243,225)";
    ctx.fillRect(-7, 0, 14, 9);
    ctx.strokeStyle = "rgba(130,90,60,0.7)";
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-7, 0, 14, 9);
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(7, 0);
    ctx.stroke();
    ctx.fillStyle = "rgb(165,35,35)";
    ctx.beginPath();
    ctx.arc(0, 5, 1.6, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = `rgb(${c.light})`;
  for (const fx of [1, 7]) {
    ctx.beginPath();
    ctx.ellipse(fx, 11, 3, 2.4, 0, 0, TAU);
    ctx.fill();
  }

  // Head: held steady while the body bobs, as real owls do.
  ctx.save();
  ctx.translate(0, -o.bob * 0.7);
  ctx.beginPath();
  ctx.arc(15, -10, 10.5, 0, TAU);
  const head = ctx.createRadialGradient(18, -13, 2, 15, -10, 11);
  head.addColorStop(0, `rgb(${c.light})`);
  head.addColorStop(1, `rgb(${c.mid})`);
  ctx.fillStyle = head;
  ctx.fill();
  ctx.strokeStyle = `rgba(${c.edge},0.5)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Facial disc, ringed.
  ctx.beginPath();
  ctx.ellipse(20.5, -9, 6.6, 8.4, 0.12, 0, TAU);
  const disc = ctx.createRadialGradient(22, -10, 1, 20.5, -9, 8.4);
  disc.addColorStop(0, `rgb(${c.face})`);
  disc.addColorStop(0.75, `rgb(${c.face})`);
  disc.addColorStop(1, `rgb(${c.mid})`);
  ctx.fillStyle = disc;
  ctx.fill();
  ctx.strokeStyle = `rgba(${c.dark},0.35)`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(${c.spot},0.35)`;
  for (const [sx, sy] of [
    [10, -15],
    [12, -18],
    [8, -11],
  ]) {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.9, 0, TAU);
    ctx.fill();
  }
  // Eye: a golden iris, a black pupil, a glint; and a heavy brow.
  const iris = ctx.createRadialGradient(23.6, -10.4, 0.3, 23.4, -10.2, 2.9);
  iris.addColorStop(0, "rgb(255,236,140)");
  iris.addColorStop(1, "rgb(222,160,30)");
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(23.4, -10.2, 2.9, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgb(15,12,10)";
  ctx.beginPath();
  ctx.arc(23.8, -10.2, 1.55, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(24.4, -11, 0.6, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(${c.edge},0.8)`;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(20.4, -13.6);
  ctx.quadraticCurveTo(23.5, -14.4, 26.4, -12.6);
  ctx.stroke();
  // A small hooked beak.
  ctx.fillStyle = pal.light ? "rgb(70,60,45)" : "rgb(55,55,60)";
  ctx.beginPath();
  ctx.moveTo(26, -8.5);
  ctx.quadraticCurveTo(29.5, -8, 28.6, -5);
  ctx.quadraticCurveTo(27.4, -6, 25.6, -6.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Near wing over the body.
  drawWing(ctx, 1, -7, o.stroke, o.wrist, c, 1);
  ctx.restore();
}
