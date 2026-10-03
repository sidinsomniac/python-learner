// Four backgrounds that only join the random pool while their common-room
// banner is equipped (see BANNER_PRESETS in src/engine/ambience.ts).
import type { Maker } from "./engine";
import { TAU, additive, clamp, count, drawStars, glow, parallax, rand, starField, toRgb } from "./engine";

/** House colours as "r,g,b": [main, accent]. */
const HOUSE_RGB: Record<string, [string, string]> = {
  gryffindor: ["200,30,30", "240,190,60"],
  slytherin: ["40,150,90", "200,210,215"],
  ravenclaw: ["50,90,200", "205,140,80"],
  hufflepuff: ["240,200,50", "60,50,30"],
};

// 1. House Colours: embers and slow ribbons of light in your own house's colours.
const houseColours: Maker = (w, h, pal, q) => {
  const [main, accent] = HOUSE_RGB[pal.house ?? "gryffindor"];
  const embers = Array.from({ length: count(70, q) }, () => ({ x: rand(0, w), y: rand(0, h), v: rand(14, 40), r: rand(0.8, 2.4), p: rand(0, TAU), c: Math.random() < 0.65 ? main : accent, depth: rand(0.2, 1) }));
  const ribbons = Array.from({ length: 3 }, (_, i) => ({ y: h * (0.25 + i * 0.22), p: rand(0, TAU), c: i === 1 ? accent : main }));
  return {
    step(ctx, f) {
      additive(ctx, pal, () => {
        for (const r of ribbons) {
          ctx.lineWidth = 18;
          ctx.strokeStyle = `rgba(${r.c},${pal.light ? 0.04 : 0.05})`;
          ctx.beginPath();
          for (let x = -20; x <= w + 20; x += 24) {
            const y = r.y + Math.sin(x * 0.006 + f.t * 0.35 + r.p) * 40 + Math.sin(x * 0.013 - f.t * 0.2) * 14;
            if (x === -20) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (const e of embers) {
          e.y -= e.v * f.dt;
          e.x += Math.sin(f.t * 0.9 + e.p) * 10 * f.dt;
          if (e.y < -10) {
            e.y = h + 10;
            e.x = rand(0, w);
          }
          const o = parallax(f, e.depth);
          const tw = 0.55 + 0.45 * Math.sin(f.t * 3 + e.p);
          glow(ctx, e.x + o.x, e.y + o.y, e.r * 5, e.c, 0.3 * tw * e.depth);
          glow(ctx, e.x + o.x, e.y + o.y, e.r * 1.4, pal.light ? e.c : "255,250,235", 0.7 * tw * e.depth, true);
        }
      });
    },
  };
};

// 2. Constellations: star charts from Astronomy, drawing themselves line by line.
const constellations: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(110, q), 1);
  const ink = pal.light ? "80,90,140" : "180,200,255";
  type Chart = { pts: { x: number; y: number }[]; age: number; life: number };
  const make = (): Chart => {
    const n = Math.floor(rand(4, 8));
    let x = rand(w * 0.1, w * 0.85);
    let y = rand(h * 0.1, h * 0.7);
    const pts = [{ x, y }];
    for (let i = 1; i < n; i++) {
      x = clamp(x + rand(-110, 110), 20, w - 20);
      y = clamp(y + rand(-70, 70), 20, h - 20);
      pts.push({ x, y });
    }
    return { pts, age: rand(-3, 0), life: rand(9, 13) };
  };
  const charts = Array.from({ length: count(3, Math.max(q, 0.7)) }, make);
  return {
    step(ctx, f) {
      drawStars(ctx, stars, f, pal);
      additive(ctx, pal, () => {
        for (let ci = 0; ci < charts.length; ci++) {
          const c = charts[ci];
          c.age += f.dt;
          if (c.age > c.life) charts[ci] = make();
          if (c.age < 0) continue;
          // Draw the lines in over the first half, hold, then fade.
          const drawn = clamp(c.age / (c.life * 0.45), 0, 1) * (c.pts.length - 1);
          const fade = c.age > c.life * 0.75 ? 1 - (c.age - c.life * 0.75) / (c.life * 0.25) : 1;
          ctx.strokeStyle = `rgba(${ink},${0.35 * fade})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.moveTo(c.pts[0].x, c.pts[0].y);
          for (let i = 1; i <= Math.floor(drawn); i++) ctx.lineTo(c.pts[i].x, c.pts[i].y);
          const k = drawn % 1;
          const i = Math.floor(drawn);
          if (i < c.pts.length - 1) ctx.lineTo(c.pts[i].x + (c.pts[i + 1].x - c.pts[i].x) * k, c.pts[i].y + (c.pts[i + 1].y - c.pts[i].y) * k);
          ctx.stroke();
          ctx.setLineDash([]);
          for (let j = 0; j <= Math.min(c.pts.length - 1, Math.ceil(drawn)); j++) {
            const p = c.pts[j];
            const tw = 0.7 + 0.3 * Math.sin(f.t * 2 + j);
            glow(ctx, p.x, p.y, 9, ink, 0.35 * fade * tw);
            glow(ctx, p.x, p.y, 2.4, pal.light ? ink : "255,255,255", 0.95 * fade, true);
          }
        }
      });
    },
  };
};

// 3. The Quidditch Pitch: goal hoops, distant flyers, flags, and the Snitch.
const quidditch: Maker = (w, h, pal, q) => {
  const gold = pal.light ? "160,110,10" : "255,205,90";
  const line = pal.light ? "rgba(70,60,40," : "rgba(220,215,200,";
  const flyers = Array.from({ length: count(6, q) }, () => ({ x: rand(0, w), y: rand(h * 0.15, h * 0.55), v: rand(30, 80) * (Math.random() < 0.5 ? -1 : 1), s: rand(0.5, 1), p: rand(0, TAU) }));
  let sx = w / 2;
  let sy = h / 3;
  let target = { x: rand(0, w), y: rand(h * 0.1, h * 0.6) };
  return {
    step(ctx, f) {
      // The hoops at each end of the pitch.
      const ground = h * 0.92;
      for (const side of [0.1, 0.9]) {
        for (const [dx, ht] of [
          [-34, 0.42],
          [0, 0.5],
          [34, 0.38],
        ] as const) {
          const x = w * side + dx;
          const top = ground - h * ht;
          ctx.strokeStyle = `${line}0.22)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, ground);
          ctx.lineTo(x, top + 16);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, top, 16, 0, TAU);
          ctx.stroke();
        }
      }
      // Fluttering house flags on the stands.
      const flags = ["174,0,1", "26,71,42", "34,47,91", "236,185,57"];
      flags.forEach((c, i) => {
        const x = w * (0.3 + i * 0.13);
        const y = h * 0.78;
        ctx.fillStyle = `rgba(${c},0.3)`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k <= 6; k++) ctx.lineTo(x + k * 6, y + Math.sin(f.t * 4 + k * 0.8 + i) * 2.5);
        for (let k = 6; k >= 0; k--) ctx.lineTo(x + k * 6, y + 18 + Math.sin(f.t * 4 + k * 0.8 + i) * 2.5);
        ctx.closePath();
        ctx.fill();
      });
      // Distant players on brooms.
      for (const p of flyers) {
        p.x += p.v * f.dt;
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        const y = p.y + Math.sin(f.t * 1.3 + p.p) * 10;
        const dir = Math.sign(p.v);
        ctx.strokeStyle = `${line}0.3)`;
        ctx.lineWidth = 1.5 * p.s;
        ctx.beginPath();
        ctx.moveTo(p.x - dir * 14 * p.s, y);
        ctx.lineTo(p.x + dir * 12 * p.s, y - 2 * p.s);
        ctx.stroke();
        ctx.fillStyle = `${line}0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, y - 6 * p.s, 3 * p.s, 0, TAU);
        ctx.fill();
      }
      // The Snitch darts between targets.
      const dx = target.x - sx;
      const dy = target.y - sy;
      if (Math.hypot(dx, dy) < 20 || Math.random() < f.dt * 0.4) target = { x: rand(w * 0.05, w * 0.95), y: rand(h * 0.1, h * 0.65) };
      sx += dx * Math.min(1, f.dt * 2.4);
      sy += dy * Math.min(1, f.dt * 2.4);
      additive(ctx, pal, () => glow(ctx, sx, sy, 22, gold, 0.4));
      const beat = Math.abs(Math.sin(f.t * 38));
      ctx.fillStyle = pal.light ? "rgba(120,120,130,0.35)" : "rgba(235,240,255,0.45)";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx + side * 9, sy - 3, 8, 2 + beat * 3, side * (0.5 - beat * 0.6), 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#f2c14e";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, TAU);
      ctx.fill();
    },
  };
};

// 4. The Four Houses: four lights in the house colours, circling a faint crest.
const fourHouses: Maker = (w, h, pal, q) => {
  const colours = ["200,30,30", "40,150,90", "50,90,200", "240,200,50"];
  const motes = Array.from({ length: count(60, q) }, () => ({ a: rand(0, TAU), r: rand(0.6, 1.25), c: colours[Math.floor(rand(0, 4))], p: rand(0, TAU) }));
  const ink = toRgb(pal.gold);
  return {
    step(ctx, f) {
      const cx = w / 2 + f.px * -14;
      const cy = h * 0.45 + f.py * -8;
      const R = Math.min(w, h) * 0.28;
      // The crest: a faint shield outline.
      ctx.strokeStyle = `rgba(${ink},0.1)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.45, cy - R * 0.5);
      ctx.lineTo(cx + R * 0.45, cy - R * 0.5);
      ctx.lineTo(cx + R * 0.45, cy);
      ctx.quadraticCurveTo(cx + R * 0.4, cy + R * 0.45, cx, cy + R * 0.65);
      ctx.quadraticCurveTo(cx - R * 0.4, cy + R * 0.45, cx - R * 0.45, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 0.5);
      ctx.lineTo(cx, cy + R * 0.65);
      ctx.moveTo(cx - R * 0.45, cy - R * 0.05);
      ctx.lineTo(cx + R * 0.45, cy - R * 0.05);
      ctx.stroke();
      additive(ctx, pal, () => {
        for (const m of motes) {
          m.a += f.dt * 0.12 * (1.4 - m.r * 0.5);
          const x = cx + Math.cos(m.a) * R * m.r * 1.3;
          const y = cy + Math.sin(m.a) * R * m.r * 0.7;
          glow(ctx, x, y, 4, m.c, 0.35 + 0.25 * Math.sin(f.t * 2 + m.p), true);
        }
        // Each house's light takes its turn to glow brightest.
        colours.forEach((c, i) => {
          const a = f.t * 0.25 + (i * TAU) / 4;
          const x = cx + Math.cos(a) * R * 1.1;
          const y = cy + Math.sin(a) * R * 0.62;
          const turn = 0.5 + 0.5 * Math.sin(f.t * 0.6 - i * (TAU / 4));
          glow(ctx, x, y, 60 + 30 * turn, c, (pal.light ? 0.12 : 0.16) + 0.18 * turn);
          glow(ctx, x, y, 7, pal.light ? c : "255,255,255", 0.5 + 0.4 * turn, true);
        });
      });
    },
  };
};

export const BANNER_MAKERS: Record<string, Maker> = {
  "house-colours": houseColours,
  constellations,
  quidditch,
  "four-houses": fourHouses,
};
