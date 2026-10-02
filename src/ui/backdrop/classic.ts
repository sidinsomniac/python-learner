// The original ten weather presets, redrawn with depth layers, glowing light
// and finer shapes.
import { drawOwl, makeOwl, stepOwl } from "./creatures";
import type { Maker } from "./engine";
import { TAU, additive, count, drawStars, glow, parallax, pick, rand, starField, wrap } from "./engine";

// 1. Enchanted Ceiling: floating candles at three depths, smoke wisps, stars.
const candles: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(70, q));
  const list = Array.from({ length: count(20, q) }, () => {
    const depth = rand(0.15, 1);
    return { x: rand(0, w), y: rand(h * 0.06, h * 0.62), p: rand(0, TAU), s: 0.45 + depth * 0.85, depth, smoke: rand(0, 6) };
  }).sort((a, b) => a.depth - b.depth);
  return {
    step(ctx, f) {
      drawStars(ctx, stars, f, pal);
      for (const c of list) {
        const o = parallax(f, c.depth);
        const x = c.x + o.x;
        const y = c.y + o.y + Math.sin(f.t * 0.7 + c.p) * 9 * c.s;
        const s = c.s;
        const flicker = 0.82 + 0.12 * Math.sin(f.t * 11 + c.p * 3) + 0.06 * Math.sin(f.t * 23 + c.p);
        const fade = 0.45 + 0.55 * c.depth;
        // Halo.
        additive(ctx, pal, () => glow(ctx, x, y - 17 * s, 34 * s * flicker, pal.light ? "200,120,30" : "255,170,70", 0.28 * fade));
        // Wax: a cylinder with a lit side and a drip.
        const body = ctx.createLinearGradient(x - 4 * s, 0, x + 4 * s, 0);
        body.addColorStop(0, pal.light ? `rgba(150,120,80,${0.5 * fade})` : `rgba(255,248,230,${0.75 * fade})`);
        body.addColorStop(1, pal.light ? `rgba(100,80,50,${0.5 * fade})` : `rgba(200,185,160,${0.6 * fade})`);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.roundRect(x - 3.6 * s, y - 10 * s, 7.2 * s, 26 * s, 1.5 * s);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 2.2 * s, y - 5 * s, 1.1 * s, 3.2 * s, 0, 0, TAU);
        ctx.fill();
        // Wick, then a two-tone flame.
        ctx.strokeStyle = `rgba(40,30,20,${0.7 * fade})`;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(x, y - 10 * s);
        ctx.lineTo(x, y - 12.5 * s);
        ctx.stroke();
        const sway = Math.sin(f.t * 3 + c.p) * 1.2 * s;
        flame(ctx, x, y - 12 * s, 3.4 * s, 9 * s * flicker, sway, `rgba(255,${150 + 40 * flicker},60,${0.85 * fade})`);
        flame(ctx, x, y - 12.5 * s, 1.6 * s, 5 * s * flicker, sway * 0.6, `rgba(255,250,225,${0.95 * fade})`);
        // A thin wisp of smoke now and then.
        const phase = (f.t * 0.25 + c.smoke) % 6;
        if (c.depth > 0.5 && phase < 2) {
          ctx.strokeStyle = pal.light ? `rgba(90,80,70,${0.18 * (1 - phase / 2)})` : `rgba(220,220,230,${0.15 * (1 - phase / 2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const top = y - 22 * s - phase * 26 * s;
          ctx.moveTo(x, y - 21 * s);
          ctx.bezierCurveTo(x + 6 * s, (y - 21 * s + top) / 2, x - 6 * s, (y - 21 * s + top) / 2, x + Math.sin(f.t + c.p) * 4 * s, top);
          ctx.stroke();
        }
      }
    },
  };
};

function flame(ctx: CanvasRenderingContext2D, x: number, base: number, width: number, height: number, sway: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.bezierCurveTo(x - width, base - height * 0.25, x - width * 0.4 + sway, base - height * 0.75, x + sway, base - height);
  ctx.bezierCurveTo(x + width * 0.4 + sway, base - height * 0.75, x + width, base - height * 0.25, x, base);
  ctx.fill();
}

// 2. First Snow: three layers, with soft out-of-focus flakes up close and wind gusts.
const snow: Maker = (w, h, pal, q) => {
  const flakes = Array.from({ length: count(210, q) }, () => {
    const depth = Math.random() ** 1.5;
    return { x: rand(0, w), y: rand(-h, h), depth, r: 1.1 + depth * 4.2, v: 14 + depth * 46, p: rand(0, TAU) };
  });
  const rgb = pal.light ? "110,130,165" : "255,255,255";
  return {
    step(ctx, f) {
      const gust = Math.sin(f.t * 0.13) * 0.6 + Math.sin(f.t * 0.37) * 0.4;
      for (const k of flakes) {
        k.y += k.v * f.dt;
        k.x += (Math.sin(f.t * 0.6 + k.p) * 14 + gust * 34) * k.depth * f.dt + gust * 6 * f.dt;
        if (k.y > h + 10) {
          k.y = -10;
          k.x = rand(-40, w + 40);
        }
        k.x = wrap(k.x, -40, w + 40);
        const o = parallax(f, k.depth);
        const bokeh = k.depth > 0.85;
        glow(ctx, k.x + o.x, k.y + o.y, bokeh ? k.r * 3.4 : k.r * 2, rgb, bokeh ? 0.28 : 0.45 + k.depth * 0.5, !bokeh);
      }
    },
  };
};

// 3. Storm over the Lake: two layers of tapered rain, gusts, branching lightning, splashes.
const storm: Maker = (w, h, pal, q) => {
  const drops = Array.from({ length: count(150, q) }, () => {
    const depth = Math.random();
    return { x: rand(-w * 0.2, w * 1.3), y: rand(-h, h), depth, l: 8 + depth * 22, v: 420 + depth * 520 };
  });
  const splashes: { x: number; y: number; age: number }[] = [];
  let bolt: { pts: [number, number][]; branches: [number, number][][]; life: number } | null = null;
  let flash = 0;
  let next = rand(3, 7);
  return {
    step(ctx, f) {
      const slant = 0.22 + Math.sin(f.t * 0.2) * 0.08;
      next -= f.dt;
      if (next <= 0) {
        bolt = lightning(rand(w * 0.1, w * 0.9), h * rand(0.45, 0.75));
        flash = 1;
        next = rand(6, 13);
      }
      if (flash > 0) {
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, `rgba(200,215,255,${0.22 * flash})`);
        sky.addColorStop(1, "rgba(200,215,255,0)");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        flash = Math.max(0, flash - f.dt * (flash > 0.6 ? 1.2 : 3));
      }
      if (bolt) {
        const a = Math.max(0, bolt.life);
        additive(ctx, pal, () => {
          for (const path of [bolt!.pts, ...bolt!.branches]) {
            ctx.beginPath();
            path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.strokeStyle = `rgba(170,190,255,${0.25 * a})`;
            ctx.lineWidth = path === bolt!.pts ? 7 : 3;
            ctx.stroke();
            ctx.strokeStyle = `rgba(245,248,255,${0.9 * a})`;
            ctx.lineWidth = path === bolt!.pts ? 1.6 : 0.8;
            ctx.stroke();
          }
        });
        bolt.life -= f.dt * 2.2;
        if (bolt.life <= 0) bolt = null;
      }
      for (const d of drops) {
        d.y += d.v * f.dt;
        d.x -= d.v * slant * f.dt;
        if (d.y > h) {
          if (d.depth > 0.6 && splashes.length < 40) splashes.push({ x: d.x, y: h - rand(2, 30), age: 0 });
          d.y = rand(-60, 0);
          d.x = rand(-w * 0.1, w * 1.3);
        }
        const o = parallax(f, d.depth * 0.6);
        const tail = ctx.createLinearGradient(d.x + o.x, d.y + o.y, d.x + o.x + d.l * slant, d.y + o.y - d.l);
        const tone = pal.light ? "60,80,120" : "185,205,240";
        tail.addColorStop(0, `rgba(${tone},${0.15 + d.depth * 0.45})`);
        tail.addColorStop(1, `rgba(${tone},0)`);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 0.6 + d.depth * 0.9;
        ctx.beginPath();
        ctx.moveTo(d.x + o.x, d.y + o.y);
        ctx.lineTo(d.x + o.x + d.l * slant, d.y + o.y - d.l);
        ctx.stroke();
      }
      ctx.strokeStyle = pal.light ? "rgba(60,80,120,0.4)" : "rgba(200,215,245,0.45)";
      ctx.lineWidth = 0.8;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.age += f.dt;
        if (s.age > 0.35) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = 1 - s.age / 0.35;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 2 + s.age * 22, 0.6 + s.age * 4, 0, Math.PI, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
};

/** A jagged bolt from the sky to `depth`, with a couple of forks. */
function lightning(x: number, depth: number) {
  const pts: [number, number][] = [[x, -10]];
  let cx = x;
  for (let y = 0; y < depth; y += rand(14, 30)) {
    cx += rand(-22, 22);
    pts.push([cx, y]);
  }
  const branches = Array.from({ length: Math.floor(rand(1, 4)) }, () => {
    const [bx, by] = pick(pts.slice(2, -2).length ? pts.slice(2, -2) : pts);
    const branch: [number, number][] = [[bx, by]];
    let px = bx;
    const dir = Math.random() < 0.5 ? -1 : 1;
    for (let y = by; y < by + rand(60, 140); y += rand(12, 24)) {
      px += dir * rand(4, 20);
      branch.push([px, y]);
    }
    return branch;
  });
  return { pts, branches, life: 1 };
}

// 4. Goblet Embers: glowing sparks with short trails, rising from a warm haze.
const embers: Maker = (w, h, pal, q) => {
  const make = () => ({ x: rand(0, w), y: h + rand(0, 80), v: rand(30, 85), life: rand(3, 8), age: 0, p: rand(0, TAU), r: rand(0.8, 2.4), hue: rand(0, 1), trail: [] as [number, number][] });
  const sparks = Array.from({ length: count(80, q) }, () => ({ ...make(), age: rand(0, 6), y: rand(0, h) }));
  return {
    step(ctx, f) {
      const haze = ctx.createLinearGradient(0, h, 0, h * 0.55);
      haze.addColorStop(0, pal.light ? "rgba(200,110,40,0.12)" : "rgba(255,110,30,0.14)");
      haze.addColorStop(1, "rgba(255,110,30,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      additive(ctx, pal, () => {
        for (const e of sparks) {
          e.age += f.dt;
          e.y -= e.v * f.dt;
          e.x += (Math.sin(f.t * 1.4 + e.p) * 18 + Math.sin(f.t * 3.1 + e.p * 2) * 6) * f.dt;
          e.trail.push([e.x, e.y]);
          if (e.trail.length > 6) e.trail.shift();
          if (e.age > e.life || e.y < -10) Object.assign(e, make());
          const a = Math.sin(Math.min(1, e.age / e.life) * Math.PI);
          const rgb = e.hue > 0.7 ? "255,220,140" : e.hue > 0.3 ? "255,150,50" : "255,95,30";
          e.trail.forEach(([tx, ty], i) => glow(ctx, tx, ty, e.r * (1 + i * 0.4), rgb, (0.08 + i * 0.05) * a, true));
          glow(ctx, e.x, e.y, e.r * 7, rgb, 0.25 * a);
          glow(ctx, e.x, e.y, e.r * 2.2, "255,240,200", 0.9 * a, true);
        }
      });
    },
  };
};

// 5. Dementor Mist: fog banks at three depths, a chill at the edges, a frost glint.
const mist: Maker = (w, h, pal, q) => {
  const banks = Array.from({ length: count(16, q) }, () => {
    const depth = rand(0, 1);
    return { x: rand(-w * 0.3, w), y: rand(h * 0.15, h * 1.05), r: 140 + depth * 320, v: 4 + depth * 16, depth, p: rand(0, TAU) };
  }).sort((a, b) => a.depth - b.depth);
  const glints = Array.from({ length: count(14, q) }, () => ({ x: rand(0, w), y: rand(0, h), p: rand(0, TAU) }));
  const rgb = pal.light ? "110,115,135" : "190,200,225";
  return {
    step(ctx, f) {
      for (const b of banks) {
        b.x += b.v * f.dt;
        if (b.x - b.r > w) b.x = -b.r;
        const o = parallax(f, b.depth);
        glow(ctx, b.x + o.x, b.y + o.y + Math.sin(f.t * 0.18 + b.p) * 24, b.r, rgb, 0.07 + b.depth * 0.06);
      }
      const chill = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      chill.addColorStop(0, "rgba(120,140,180,0)");
      chill.addColorStop(1, pal.light ? "rgba(90,100,130,0.12)" : "rgba(140,160,210,0.12)");
      ctx.fillStyle = chill;
      ctx.fillRect(0, 0, w, h);
      additive(ctx, pal, () => {
        for (const g of glints) {
          const a = Math.max(0, Math.sin(f.t * 0.5 + g.p)) ** 12;
          glow(ctx, g.x, g.y, 5, "220,235,255", 0.7 * a, true);
        }
      });
    },
  };
};

// 6. Forbidden Forest: wandering fireflies at three depths above swaying grass.
const fireflies: Maker = (w, h, pal, q) => {
  const flies = Array.from({ length: count(70, q) }, () => {
    const depth = rand(0, 1);
    return { x: rand(0, w), y: rand(h * 0.25, h), a: rand(0, TAU), v: 10 + depth * 26, p: rand(0, TAU), depth, rate: rand(1.4, 3) };
  });
  const blades = Array.from({ length: count(70, q) }, () => ({ x: rand(-10, w + 10), hgt: rand(18, 60), p: rand(0, TAU), lean: rand(-0.3, 0.3) }));
  return {
    step(ctx, f) {
      additive(ctx, pal, () => {
        for (const k of flies) {
          k.a += (Math.sin(f.t * 0.7 + k.p) * 1.2 + rand(-0.6, 0.6)) * f.dt;
          k.x = wrap(k.x + Math.cos(k.a) * k.v * f.dt, -20, w + 20);
          k.y = Math.min(h - 10, Math.max(h * 0.15, k.y + Math.sin(k.a) * k.v * f.dt));
          const pulse = Math.max(0, Math.sin(f.t * k.rate + k.p)) ** 2;
          const o = parallax(f, k.depth);
          const size = 0.6 + k.depth * 0.8;
          glow(ctx, k.x + o.x, k.y + o.y, 30 * size, pal.light ? "120,150,20" : "190,255,110", 0.42 * pulse);
          glow(ctx, k.x + o.x, k.y + o.y, 4.5 * size, pal.light ? "90,110,10" : "240,255,190", 0.25 + 0.75 * pulse, true);
        }
      });
      ctx.strokeStyle = pal.light ? "rgba(60,80,40,0.25)" : "rgba(10,25,15,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const b of blades) {
        const sway = Math.sin(f.t * 0.9 + b.p) * 5 + b.lean * b.hgt;
        ctx.moveTo(b.x, h);
        ctx.quadraticCurveTo(b.x + sway * 0.3, h - b.hgt * 0.6, b.x + sway, h - b.hgt);
      }
      ctx.stroke();
    },
  };
};

// 7. Autumn Grounds: proper leaves that tumble and flip in the wind.
const leaves: Maker = (w, h, pal, q) => {
  const colours = pal.light ? ["#b5541f", "#c98b1f", "#933422", "#7d5a1f", "#a6741c"] : ["#d8702c", "#e6a630", "#b8452c", "#a07a32", "#c95a28"];
  const list = Array.from({ length: count(48, q) }, () => {
    const depth = rand(0, 1);
    return { x: rand(0, w), y: rand(-h, h), depth, v: 20 + depth * 40, rot: rand(0, TAU), spin: rand(-1.8, 1.8), flip: rand(0, TAU), flipRate: rand(1, 3), p: rand(0, TAU), c: pick(colours), s: 6 + depth * 11 };
  }).sort((a, b) => a.depth - b.depth);
  return {
    step(ctx, f) {
      const gust = Math.max(0, Math.sin(f.t * 0.21)) * 60;
      for (const l of list) {
        l.y += l.v * f.dt;
        l.x += (Math.sin(f.t * 0.8 + l.p) * 26 + 14 + gust * l.depth) * f.dt;
        l.rot += l.spin * f.dt;
        l.flip += l.flipRate * f.dt;
        if (l.y > h + 20 || l.x > w + 40) {
          l.y = rand(-40, -10);
          l.x = rand(-60, w * 0.9);
        }
        const o = parallax(f, l.depth);
        ctx.save();
        ctx.translate(l.x + o.x, l.y + o.y);
        ctx.rotate(l.rot);
        ctx.scale(Math.cos(l.flip), 1);
        ctx.globalAlpha = 0.55 + l.depth * 0.4;
        ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.moveTo(0, -l.s);
        ctx.bezierCurveTo(l.s * 0.75, -l.s * 0.45, l.s * 0.6, l.s * 0.55, 0, l.s);
        ctx.bezierCurveTo(-l.s * 0.6, l.s * 0.55, -l.s * 0.75, -l.s * 0.45, 0, -l.s);
        ctx.fill();
        ctx.strokeStyle = "rgba(60,30,10,0.45)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, -l.s * 0.9);
        ctx.lineTo(0, l.s * 1.35);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };
};

// 8. Aurora: hanging curtains of light that ripple and shift colour, over stars.
const aurora: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(60, q), 0.9);
  const curtains = [
    { y: h * 0.2, rgb: "80,255,180", amp: 46, f: 0.0035, s: 0.22, tall: h * 0.22 },
    { y: h * 0.3, rgb: "150,110,255", amp: 60, f: 0.0026, s: 0.16, tall: h * 0.26 },
    { y: h * 0.38, rgb: "70,200,255", amp: 38, f: 0.0048, s: 0.28, tall: h * 0.18 },
  ];
  const step = Math.max(5, Math.round(9 / q));
  return {
    step(ctx, f) {
      drawStars(ctx, stars, f, pal);
      additive(ctx, pal, () => {
        for (const c of curtains) {
          const o = parallax(f, 0.25);
          for (let x = -step; x <= w + step; x += step) {
            const y = c.y + o.y + Math.sin(x * c.f + f.t * c.s) * c.amp + Math.sin(x * c.f * 2.7 - f.t * c.s * 1.6) * c.amp * 0.35;
            const shimmer = 0.55 + 0.45 * Math.sin(x * 0.02 + f.t * 1.3 + c.y);
            const tall = c.tall * (0.7 + 0.3 * Math.sin(x * 0.006 + f.t * 0.4));
            const g = ctx.createLinearGradient(0, y - tall, 0, y + 40);
            g.addColorStop(0, `rgba(${c.rgb},0)`);
            g.addColorStop(0.6, `rgba(${c.rgb},${(pal.light ? 0.05 : 0.09) * shimmer})`);
            g.addColorStop(0.82, `rgba(${c.rgb},${(pal.light ? 0.1 : 0.2) * shimmer})`);
            g.addColorStop(1, `rgba(${c.rgb},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(x + o.x, y - tall, step + 1, tall + 40);
          }
        }
      });
    },
  };
};

// 9. Astronomy Tower: a deep star field, the Milky Way, and glowing shooting stars.
const shootingStars: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(130, q), 0.95);
  const band = Array.from({ length: count(40, q) }, (_, i) => {
    const t = i / 40;
    return { x: t * w * 1.2 - w * 0.1, y: h * 0.75 - t * h * 0.6 + rand(-50, 50), r: rand(40, 110) };
  });
  const shots: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  let wait = rand(0.4, 1.5);
  return {
    step(ctx, f) {
      const o = parallax(f, 0.1);
      additive(ctx, pal, () => band.forEach((b) => glow(ctx, b.x + o.x, b.y + o.y, b.r, pal.light ? "120,100,150" : "170,160,230", 0.035)));
      drawStars(ctx, stars, f, pal);
      wait -= f.dt;
      if (wait <= 0) {
        const speed = rand(600, 950);
        const angle = rand(0.35, 0.6);
        shots.push({ x: rand(w * 0.3, w * 1.1), y: rand(-20, h * 0.35), vx: -Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
        wait = Math.random() < 0.25 ? rand(0.15, 0.4) : rand(1.5, 4);
      }
      additive(ctx, pal, () => {
        for (let i = shots.length - 1; i >= 0; i--) {
          const s = shots[i];
          s.x += s.vx * f.dt;
          s.y += s.vy * f.dt;
          s.life -= f.dt * 0.9;
          const a = Math.max(0, Math.min(1, s.life * 2));
          const tx = s.x - s.vx * 0.22;
          const ty = s.y - s.vy * 0.22;
          const tail = ctx.createLinearGradient(s.x, s.y, tx, ty);
          tail.addColorStop(0, pal.light ? `rgba(90,70,30,${a})` : `rgba(255,255,255,${a})`);
          tail.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = tail;
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          glow(ctx, s.x, s.y, 9, pal.light ? "120,90,30" : "230,240,255", 0.8 * a, true);
          if (s.life <= 0) shots.splice(i, 1);
        }
      });
    },
  };
};

// 10. Owl Post: owls flapping across with letters, envelopes fluttering, feathers drifting.
const owlPost: Maker = (w, h, pal, q) => {
  const ink = pal.light ? "rgba(70,55,35," : "rgba(235,225,200,";
  // Far owls first, so nearer ones pass in front.
  const owls = Array.from({ length: count(5, q) }, () => makeOwl(w, h)).sort((a, b) => a.depth - b.depth);
  const letters = Array.from({ length: count(9, q) }, () => ({ x: rand(0, w), y: rand(-h, h), v: rand(14, 30), p: rand(0, TAU), s: rand(7, 12) }));
  const feathers = Array.from({ length: count(14, q) }, () => ({ x: rand(0, w), y: rand(-h, h), v: rand(10, 24), p: rand(0, TAU), s: rand(7, 13) }));
  return {
    step(ctx, f) {
      for (const o of owls) {
        stepOwl(o, f.dt, w, h);
        drawOwl(ctx, o, pal);
      }
      for (const l of letters) {
        l.y += l.v * f.dt;
        l.x += Math.sin(f.t * 0.8 + l.p) * 22 * f.dt;
        if (l.y > h + 20) {
          l.y = -20;
          l.x = rand(0, w);
        }
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(Math.sin(f.t * 1.2 + l.p) * 0.5);
        ctx.scale(1, 0.65 + 0.35 * Math.cos(f.t * 2 + l.p));
        ctx.fillStyle = `${ink}0.4)`;
        ctx.strokeStyle = `${ink}0.6)`;
        ctx.lineWidth = 0.8;
        ctx.fillRect(-l.s, -l.s * 0.65, l.s * 2, l.s * 1.3);
        ctx.beginPath();
        ctx.moveTo(-l.s, -l.s * 0.65);
        ctx.lineTo(0, l.s * 0.1);
        ctx.lineTo(l.s, -l.s * 0.65);
        ctx.stroke();
        ctx.fillStyle = "rgba(170,40,40,0.7)";
        ctx.beginPath();
        ctx.arc(0, l.s * 0.1, l.s * 0.16, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      for (const k of feathers) {
        k.y += k.v * f.dt;
        k.x += Math.sin(f.t + k.p) * 24 * f.dt;
        if (k.y > h + 20) {
          k.y = -20;
          k.x = rand(0, w);
        }
        drawFeather(ctx, k.x, k.y, k.s, Math.sin(f.t * 1.3 + k.p) * 0.9, `${ink}0.5)`);
      }
    },
  };
};

export function drawFeather(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.45, -s * 0.5, s * 0.4, s * 0.5, 0, s * 0.8);
  ctx.bezierCurveTo(-s * 0.3, s * 0.4, -s * 0.4, -s * 0.5, 0, -s);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s * 1.2);
  ctx.stroke();
  ctx.restore();
}

export const CLASSIC: Record<string, Maker> = {
  candles,
  snow,
  storm,
  embers,
  mist,
  fireflies,
  leaves,
  aurora,
  "shooting-stars": shootingStars,
  "owl-post": owlPost,
};

