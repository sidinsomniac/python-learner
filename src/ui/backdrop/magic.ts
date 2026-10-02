// Eight newer presets: Patronus, Golden Snitch, Floo fire, Fawkes, the Black
// Lake, the Hogwarts Express, the Pensieve and the Time-Turner.
import { drawFeather } from "./classic";
import { drawStag } from "./creatures";
import type { Maker } from "./engine";
import { TAU, additive, clamp, count, drawStars, glow, parallax, rand, starField, wrap } from "./engine";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  r: number;
}

/** Update and draw short-lived glowing motes; dead ones are removed. */
function stepMotes(ctx: CanvasRenderingContext2D, motes: Mote[], dt: number, rgb: string, alpha: number) {
  for (let i = motes.length - 1; i >= 0; i--) {
    const m = motes[i];
    m.age += dt;
    if (m.age >= m.life) {
      motes.splice(i, 1);
      continue;
    }
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    const a = 1 - m.age / m.life;
    glow(ctx, m.x, m.y, m.r * (1 + a), rgb, alpha * a, true);
  }
}

/** Can canvas drawing be blurred with ctx.filter? (Not in older Safari.) */
const canBlur = typeof CanvasRenderingContext2D !== "undefined" && "filter" in CanvasRenderingContext2D.prototype;

/** A tapering, fading ribbon through a trail of points (oldest first). */
function drawRibbon(ctx: CanvasRenderingContext2D, pts: { x: number; y: number; age: number; seed: number }[], life: number, width: number, rgb: string, alpha: number) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const fresh = 1 - b.age / life;
    if (fresh <= 0) continue;
    // Smoke spreads as it ages, fades towards the tail of the ribbon, and is patchy along its length.
    const wisp = 0.5 + 0.5 * Math.sin(i * 0.45 + b.seed * 0.3 + b.age * 3);
    ctx.lineWidth = Math.max(0.5, width * (0.3 + 0.7 * fresh) * (1 + (1 - fresh) * 2.2));
    // Each strand fades in over its first moments, so it seems to emerge from behind the stag.
    const emerge = Math.min(1, b.age / 0.22);
    ctx.strokeStyle = `rgba(${rgb},${alpha * emerge * fresh ** 1.4 * (0.35 + 0.65 * wisp)})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

// 11. Expecto Patronum: a silver stag galloping across the sky, trailing light.
const patronus: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(40, q));
  const silver = pal.light ? "90,110,150" : "200,225,255";
  const motes: Mote[] = [];
  const ambient = Array.from({ length: count(30, q) }, () => ({ x: rand(0, w), y: rand(0, h), p: rand(0, TAU), v: rand(4, 12) }));
  const size = clamp(h / 700, 0.75, 1.35) * 1.15;
  /** Local units the stag covers in one stride: ties leg speed to ground speed, so hooves never slide. */
  const stride = 150;
  const speed = Math.max(95, w / 11);
  let dir = 1;
  let x = 0;
  let baseY = 0;
  let phase = 0;
  const lastU: number[] = [0, 0, 0, 0];
  const prints: Mote[] = [];
  const glitter: Mote[] = [];
  // The trail: for each emitter, a ribbon of recent positions that drift, curl and fade.
  type Wisp = { x: number; y: number; age: number; seed: number };
  const ribbons: Wisp[][] = [[], [], [], []];
  const LIFE = [0.9, 2.1, 2.3, 1.8];
  const WIDTH = [1.6, 20, 24, 16];
  /** How each strand drifts: the back's smoke rises, the belly's sinks a little. */
  const DRIFT = [0, -16, -7, 6];
  // Smoke is drawn at half resolution, then blurred onto the screen in one pass.
  const smoke = document.createElement("canvas");
  smoke.width = Math.ceil(w / 2);
  smoke.height = Math.ceil(h / 2);
  const sctx = smoke.getContext("2d")!;
  const enter = () => {
    dir = Math.random() < 0.7 ? 1 : -1;
    x = dir > 0 ? -230 * size : w + 230 * size;
    baseY = rand(h * 0.36, h * 0.62);
  };
  enter();
  return {
    step(ctx, f) {
      drawStars(ctx, stars, f, pal);
      x += speed * dir * f.dt;
      if ((dir > 0 && x > w + 240 * size) || (dir < 0 && x < -240 * size)) enter();
      phase += (speed * f.dt) / (stride * size);
      const o = parallax(f, 0.6);
      // A gentle rise and fall along the way, like running over rolling ground.
      const bx = x + o.x;
      const by = baseY + Math.sin(x * 0.0045) * 22 + o.y;
      additive(ctx, pal, () => {
        for (const a of ambient) {
          a.y = wrap(a.y - a.v * f.dt, -10, h + 10);
          glow(ctx, a.x, a.y, 3, silver, 0.25 + 0.25 * Math.sin(f.t + a.p), true);
        }
        // Wisps of light shed from the body, drifting behind.
        if (motes.length < 160) {
          for (let i = 0; i < 2; i++) {
            motes.push({ x: bx - dir * rand(10, 70) * size, y: by + rand(-35, 25) * size, vx: -dir * rand(15, 55), vy: rand(-14, 8), age: 0, life: rand(0.9, 2), r: rand(1.2, 3) });
          }
        }
        stepMotes(ctx, motes, f.dt, silver, 0.45);
        // Hoofprints of light: a burst wherever a hoof touches down, lingering in the air.
        stepMotes(ctx, prints, f.dt, silver, 0.75);
        // The smoky trail and the antler's streak of light, drawn behind the stag.
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.clearRect(0, 0, smoke.width, smoke.height);
        sctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
        sctx.lineCap = "round";
        sctx.lineJoin = "round";
        for (let r = 1; r < ribbons.length; r++) drawRibbon(sctx, ribbons[r], LIFE[r], WIDTH[r] * size, silver, 0.095);
        if (canBlur) {
          ctx.filter = `blur(${Math.round(10 * size)}px)`;
          ctx.drawImage(smoke, 0, 0, w, h);
          ctx.filter = `blur(${Math.round(3 * size)}px)`;
          ctx.globalAlpha = 0.6;
          ctx.drawImage(smoke, 0, 0, w, h);
          ctx.globalAlpha = 1;
          ctx.filter = "none";
        } else {
          ctx.drawImage(smoke, 0, 0, w, h);
        }
        stepMotes(ctx, glitter, f.dt, silver, 0.9);
        const { hooves, emitters } = drawStag(ctx, bx, by, size, dir, phase, f.t, pal);
        emitters.forEach((e, i) => {
          // The antler tip sheds glittering sparks; the body leaves smoke.
          if (i === 0) {
            if (glitter.length < 90) glitter.push({ x: e.x + rand(-6, 6) * size, y: e.y + rand(-4, 10) * size, vx: -dir * rand(5, 30), vy: rand(-8, 14), age: 0, life: rand(0.5, 1.3), r: rand(0.8, 2) });
            return;
          }
          ribbons[i].push({ x: e.x, y: e.y, age: 0, seed: rand(0, TAU) });
          if (i > 0 && Math.random() < f.dt * 10 && motes.length < 160) {
            motes.push({ x: e.x, y: e.y, vx: -dir * rand(10, 40), vy: rand(-6, 22), age: 0, life: rand(0.8, 1.6), r: rand(0.8, 2) });
          }
        });
        for (const [i, ribbon] of ribbons.entries()) {
          for (const p of ribbon) {
            p.age += f.dt;
            // Smoke lingers where it was left, drifting, and curling more the older it gets.
            const k = i === 0 ? 0.35 : 1;
            p.y += (DRIFT[i] * (0.6 + p.age) + Math.cos(p.age * 2.1 + p.seed) * (6 + p.age * 22)) * k * f.dt;
            p.x += (Math.sin(p.age * 2.4 + p.seed) * (8 + p.age * 26) - dir * 10) * k * f.dt;
          }
          while (ribbon.length && ribbon[0].age > LIFE[i]) ribbon.shift();
        }
        hooves.forEach((hoof, i) => {
          if (hoof.u < lastU[i] && prints.length < 200) {
            for (let k = 0; k < (hoof.far ? 4 : 7); k++) {
              prints.push({ x: hoof.x + rand(-4, 4) * size, y: hoof.y + rand(-2, 2), vx: rand(-14, 14), vy: rand(-26, -6), age: 0, life: rand(0.8, 1.7), r: rand(1.2, 2.8) });
            }
            glow(ctx, hoof.x, hoof.y, 16 * size, silver, 0.45, false);
          }
          lastU[i] = hoof.u;
        });
      });
    },
  };
};

// 12. The Golden Snitch: darting, hovering, and leaving a shimmering wake.
const snitch: Maker = (w, h, pal, q) => {
  const gold = pal.light ? "160,110,10" : "255,205,90";
  const wake: Mote[] = [];
  const dust = Array.from({ length: count(40, q) }, () => ({ x: rand(0, w), y: rand(0, h), p: rand(0, TAU) }));
  let x = w / 2;
  let y = h / 3;
  let vx = 0;
  let vy = 0;
  let target = { x: rand(0, w), y: rand(0, h * 0.7) };
  let hover = 0;
  return {
    step(ctx, f) {
      hover -= f.dt;
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 30 || Math.random() < f.dt * 0.25) {
        target = { x: rand(w * 0.05, w * 0.95), y: rand(h * 0.08, h * 0.75) };
        hover = Math.random() < 0.35 ? rand(0.6, 1.6) : 0;
      }
      if (hover > 0) {
        vx *= 0.9;
        vy *= 0.9;
      } else {
        const pull = 900;
        vx += (dx / (dist || 1)) * pull * f.dt;
        vy += (dy / (dist || 1)) * pull * f.dt;
        const sp = Math.hypot(vx, vy);
        const max = 520;
        if (sp > max) {
          vx = (vx / sp) * max;
          vy = (vy / sp) * max;
        }
      }
      x += vx * f.dt + (hover > 0 ? Math.sin(f.t * 13) * 0.6 : 0);
      y += vy * f.dt + (hover > 0 ? Math.cos(f.t * 11) * 0.6 : 0);
      x = clamp(x, -20, w + 20);
      y = clamp(y, -20, h + 20);
      additive(ctx, pal, () => {
        for (const d of dust) glow(ctx, d.x, d.y, 2, gold, 0.15 + 0.15 * Math.sin(f.t * 0.8 + d.p), true);
        if (Math.hypot(vx, vy) > 60 && wake.length < 120) {
          wake.push({ x: x + rand(-3, 3), y: y + rand(-3, 3), vx: -vx * 0.05, vy: -vy * 0.05 + rand(-10, 10), age: 0, life: rand(0.5, 1.1), r: rand(1.5, 3) });
        }
        stepMotes(ctx, wake, f.dt, gold, 0.6);
        glow(ctx, x, y, 34, gold, 0.3);
      });
      // Silvery wings beating too fast to see, then the golden ball.
      const beat = Math.abs(Math.sin(f.t * 38));
      const tilt = Math.atan2(vy, vx) * 0.15;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.fillStyle = pal.light ? "rgba(120,120,130,0.35)" : "rgba(235,240,255,0.45)";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 13, -4, 12, 3 + beat * 4, side * (0.5 - beat * 0.6), 0, TAU);
        ctx.fill();
      }
      const ball = ctx.createRadialGradient(-2, -2, 0.5, 0, 0, 6);
      ball.addColorStop(0, "#fff6c8");
      ball.addColorStop(0.5, "#f2c14e");
      ball.addColorStop(1, "#a8761c");
      ctx.fillStyle = ball;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    },
  };
};

/** A field of flame particles rising from the bottom of the screen. */
function flames(w: number, h: number, q: number, n: number) {
  const make = (age = 0) => ({ x: rand(-20, w + 20), y: h + rand(0, 40), v: rand(50, 130), r: rand(18, 46), age, life: rand(1.2, 2.6), p: rand(0, TAU) });
  return { list: Array.from({ length: count(n, q) }, () => make(rand(0, 2))), make };
}

/** A row of flame tongues along the bottom edge, flickering and swaying. */
function tongues(w: number, h: number, q: number) {
  return Array.from({ length: count(Math.ceil(w / 38), q) }, () => ({ x: rand(-20, w + 20), p: rand(0, TAU), hgt: rand(h * 0.08, h * 0.24), wid: rand(14, 30) }));
}

function drawTongues(ctx: CanvasRenderingContext2D, list: ReturnType<typeof tongues>, h: number, t: number, outer: string, inner: string) {
  for (const tg of list) {
    const height = tg.hgt * (0.7 + 0.3 * Math.sin(t * 2.6 + tg.p)) + Math.sin(t * 9 + tg.p * 2) * 8;
    const sway = Math.sin(t * 1.8 + tg.p) * 14 + Math.sin(t * 5 + tg.p) * 4;
    for (const [rgb, scale, alpha] of [[outer, 1, 0.22], [inner, 0.45, 0.35]] as [string, number, number][]) {
      const top = h - height * scale;
      const g = ctx.createLinearGradient(0, h, 0, top);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      const half = tg.wid * scale;
      ctx.moveTo(tg.x - half, h + 4);
      ctx.bezierCurveTo(tg.x - half, h - height * scale * 0.45, tg.x + sway * 0.4 - half * 0.3, h - height * scale * 0.8, tg.x + sway * scale, top);
      ctx.bezierCurveTo(tg.x + sway * 0.4 + half * 0.3, h - height * scale * 0.8, tg.x + half, h - height * scale * 0.45, tg.x + half, h + 4);
      ctx.fill();
    }
  }
}

// 13. The Floo Network: emerald flames licking up from the hearth, with sparks.
const floo: Maker = (w, h, pal, q) => {
  const fire = flames(w, h, q, 50);
  const row = tongues(w, h, q);
  const sparks: Mote[] = [];
  const green = pal.light ? "30,130,70" : "60,255,140";
  const core = pal.light ? "20,90,60" : "200,255,220";
  return {
    step(ctx, f) {
      const base = ctx.createLinearGradient(0, h, 0, h * 0.5);
      base.addColorStop(0, pal.light ? "rgba(30,140,80,0.14)" : "rgba(40,220,120,0.16)");
      base.addColorStop(1, "rgba(40,220,120,0)");
      ctx.fillStyle = base;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);
      additive(ctx, pal, () => {
        drawTongues(ctx, row, h, f.t, green, core);
        for (const p of fire.list) {
          p.age += f.dt;
          p.y -= p.v * f.dt;
          p.x += Math.sin(f.t * 2.4 + p.p) * 22 * f.dt;
          if (p.age > p.life) Object.assign(p, fire.make());
          const k = p.age / p.life;
          const a = Math.sin(k * Math.PI) * (1 - k * 0.4);
          glow(ctx, p.x, p.y, p.r * (1 - k * 0.6), green, 0.16 * a);
          glow(ctx, p.x, p.y + 6, p.r * 0.35 * (1 - k), core, 0.22 * a, true);
        }
        if (Math.random() < f.dt * 14 && sparks.length < 60) {
          sparks.push({ x: rand(0, w), y: h - rand(0, 60), vx: rand(-30, 30), vy: rand(-220, -90), age: 0, life: rand(0.8, 1.8), r: rand(1, 2.2) });
        }
        stepMotes(ctx, sparks, f.dt, core, 0.9);
      });
    },
  };
};

// 14. Fawkes: phoenix fire rising, golden-red feathers falling, and a rebirth flare.
const fawkes: Maker = (w, h, pal, q) => {
  const fire = flames(w, h, q, 45);
  const row = tongues(w, h, q);
  const feathers = Array.from({ length: count(18, q) }, () => ({ x: rand(0, w), y: rand(-h, h), v: rand(18, 36), p: rand(0, TAU), s: rand(11, 20), hue: rand(0, 1) }));
  let burst = -1;
  let next = rand(5, 10);
  let bx = w / 2;
  let byy = h / 2;
  return {
    step(ctx, f) {
      next -= f.dt;
      if (next <= 0) {
        burst = 0;
        bx = rand(w * 0.2, w * 0.8);
        byy = rand(h * 0.25, h * 0.6);
        next = rand(9, 15);
      }
      additive(ctx, pal, () => {
        drawTongues(ctx, row, h, f.t, pal.light ? "190,80,20" : "255,110,40", pal.light ? "200,130,30" : "255,220,140");
        for (const p of fire.list) {
          p.age += f.dt;
          p.y -= p.v * f.dt;
          p.x += Math.sin(f.t * 2 + p.p) * 18 * f.dt;
          if (p.age > p.life) Object.assign(p, fire.make());
          const k = p.age / p.life;
          const a = Math.sin(k * Math.PI);
          const rgb = k < 0.35 ? "255,225,140" : k < 0.7 ? "255,130,40" : "220,50,30";
          glow(ctx, p.x, p.y, p.r * (1 - k * 0.5) * 0.8, pal.light ? "190,80,20" : rgb, 0.14 * a);
        }
        if (burst >= 0) {
          burst += f.dt;
          const r = burst * 420;
          const a = Math.max(0, 1 - burst / 1.4);
          ctx.strokeStyle = pal.light ? `rgba(190,90,20,${0.4 * a})` : `rgba(255,190,90,${0.5 * a})`;
          ctx.lineWidth = 3 + 10 * a;
          ctx.beginPath();
          ctx.arc(bx, byy, r, 0, TAU);
          ctx.stroke();
          glow(ctx, bx, byy, 160 * a + 20, "255,200,110", 0.4 * a);
          if (burst > 1.4) burst = -1;
        }
      });
      for (const k of feathers) {
        k.y += k.v * f.dt;
        k.x += Math.sin(f.t * 0.9 + k.p) * 26 * f.dt;
        if (k.y > h + 20) {
          k.y = -20;
          k.x = rand(0, w);
        }
        const color = pal.light ? "rgba(160,60,20,0.45)" : k.hue > 0.5 ? "rgba(255,170,60,0.6)" : "rgba(230,70,40,0.6)";
        drawFeather(ctx, k.x, k.y, k.s, Math.sin(f.t * 1.1 + k.p) * 0.8 + 0.4, color);
      }
    },
  };
};

// 15. The Black Lake: a moonlit lake with glittering reflections, ripples and a curious squid.
const lake: Maker = (w, h, pal, q) => {
  const stars = starField(w, h, count(60, q), 0.5);
  const horizon = h * 0.62;
  const moon = { x: w * 0.72, y: h * 0.2 };
  const ripples: { x: number; y: number; age: number }[] = [];
  const glitter = Array.from({ length: count(70, q) }, () => ({ y: rand(horizon + 6, h), off: rand(-1, 1), p: rand(0, TAU) }));
  let squid = -1;
  let squidX = w * 0.3;
  let nextSquid = rand(6, 12);
  return {
    step(ctx, f) {
      drawStars(ctx, stars, f, pal);
      const o = parallax(f, 0.15);
      const moonRgb = pal.light ? "150,140,110" : "240,240,220";
      additive(ctx, pal, () => {
        glow(ctx, moon.x + o.x, moon.y + o.y, 120, moonRgb, 0.16);
        glow(ctx, moon.x + o.x, moon.y + o.y, 26, moonRgb, 0.85, true);
      });
      const water = ctx.createLinearGradient(0, horizon, 0, h);
      water.addColorStop(0, pal.light ? "rgba(60,80,110,0.10)" : "rgba(10,30,45,0.35)");
      water.addColorStop(1, pal.light ? "rgba(40,60,90,0.18)" : "rgba(5,15,25,0.55)");
      ctx.fillStyle = water;
      ctx.fillRect(0, horizon, w, h - horizon);
      additive(ctx, pal, () => {
        for (const g of glitter) {
          const spread = (g.y - horizon) * 0.35 + 10;
          const gx = moon.x + o.x + g.off * spread + Math.sin(f.t * 0.8 + g.p) * 8;
          const a = Math.max(0, Math.sin(f.t * 2.2 + g.p)) ** 3;
          ctx.fillStyle = `rgba(${moonRgb},${0.55 * a})`;
          ctx.fillRect(gx - 6, g.y, 12 + spread * 0.08, 1.2);
        }
      });
      if (Math.random() < f.dt * 1.2 && ripples.length < 12) ripples.push({ x: rand(0, w), y: rand(horizon + 15, h - 10), age: 0 });
      ctx.lineWidth = 1;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += f.dt;
        if (r.age > 3) {
          ripples.splice(i, 1);
          continue;
        }
        const depthScale = (r.y - horizon) / (h - horizon);
        ctx.strokeStyle = pal.light ? `rgba(60,80,110,${0.3 * (1 - r.age / 3)})` : `rgba(170,200,230,${0.3 * (1 - r.age / 3)})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.age * 40 * (0.5 + depthScale), r.age * 7 * (0.5 + depthScale), 0, 0, TAU);
        ctx.stroke();
      }
      // Now and then, a tentacle rises from the water and sinks again.
      nextSquid -= f.dt;
      if (squid < 0 && nextSquid <= 0) {
        squid = 0;
        squidX = rand(w * 0.1, w * 0.9);
      }
      if (squid >= 0) {
        squid += f.dt;
        const rise = Math.sin(Math.min(1, squid / 6) * Math.PI);
        const tall = 130 * rise;
        const baseY = horizon + 30;
        ctx.fillStyle = pal.light ? "rgba(40,60,70,0.35)" : "rgba(20,45,55,0.75)";
        ctx.beginPath();
        const sway = Math.sin(squid * 1.6) * 30;
        ctx.moveTo(squidX - 14, baseY);
        ctx.bezierCurveTo(squidX - 16, baseY - tall * 0.5, squidX + sway - 10, baseY - tall * 0.8, squidX + sway + 18, baseY - tall);
        ctx.bezierCurveTo(squidX + sway - 2, baseY - tall * 0.75, squidX + 2, baseY - tall * 0.4, squidX + 14, baseY);
        ctx.closePath();
        ctx.fill();
        if (squid > 6) {
          squid = -1;
          nextSquid = rand(12, 20);
        }
      }
    },
  };
};

// 16. The Hogwarts Express: a lit train crossing the horizon, steam rolling out behind it.
const express: Maker = (w, h, pal, q) => {
  const ground = h * 0.86;
  const puffs: { x: number; y: number; r: number; age: number; life: number; vx: number }[] = [];
  const hills = Array.from({ length: 6 }, (_, i) => ({ x: (i / 5) * w, r: rand(w * 0.15, w * 0.3), hgt: rand(30, 90) }));
  let x = -260;
  const speed = Math.max(70, w / 16);
  const steam = pal.light ? "120,120,130" : "225,228,235";
  return {
    step(ctx, f) {
      x += speed * f.dt;
      if (x > w + 520) x = -260;
      const o = parallax(f, 0.2);
      ctx.fillStyle = pal.light ? "rgba(70,80,70,0.14)" : "rgba(8,14,20,0.55)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const hill of hills) ctx.ellipse(hill.x + o.x, ground + 8, hill.r, hill.hgt, 0, Math.PI, TAU);
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillRect(0, ground, w, h - ground);
      // Steam from the funnel, growing and fading as it drifts back.
      if (Math.random() < f.dt * 10 && puffs.length < count(80, q)) puffs.push({ x: x + 21, y: ground - 78, r: rand(8, 14), age: 0, life: rand(3, 5.5), vx: rand(-30, -10) });
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += f.dt;
        if (p.age > p.life) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx * f.dt;
        p.y -= (22 - p.age * 3) * f.dt;
        const k = p.age / p.life;
        glow(ctx, p.x, p.y, p.r + k * 90, steam, 0.32 * (1 - k));
      }
      // The engine and four carriages, with warm lit windows, drawn larger and anchored on the ground.
      ctx.save();
      ctx.translate(x, ground);
      ctx.scale(1.5, 1.5);
      ctx.translate(-x, -ground);
      ctx.fillStyle = pal.light ? "rgba(60,30,30,0.5)" : "rgba(25,10,12,0.9)";
      const bodyY = ground - 26;
      ctx.fillRect(x - 40, bodyY, 70, 22);
      ctx.fillRect(x + 6, bodyY - 26, 16, 28);
      ctx.fillRect(x - 40, bodyY - 12, 26, 12);
      for (let c = 1; c <= 4; c++) ctx.fillRect(x - 40 - c * 88, bodyY - 6, 82, 28);
      ctx.fillStyle = pal.light ? "rgba(60,30,30,0.5)" : "rgba(25,10,12,0.9)";
      for (const wx of [-30, 0, 20]) {
        ctx.beginPath();
        ctx.arc(x + wx, ground - 2, 6, 0, TAU);
        ctx.fill();
      }
      additive(ctx, pal, () => {
        for (let c = 1; c <= 4; c++) {
          for (let wn = 0; wn < 5; wn++) {
            const wx = x - 40 - c * 88 + 8 + wn * 15;
            const flick = 0.75 + 0.25 * Math.sin(f.t * 3 + c * 7 + wn);
            ctx.fillStyle = pal.light ? `rgba(200,140,40,${0.6 * flick})` : `rgba(255,200,110,${0.85 * flick})`;
            ctx.fillRect(wx, bodyY + 1, 9, 8);
            glow(ctx, wx + 4.5, bodyY + 5, 16, "255,190,90", 0.12 * flick);
          }
        }
        glow(ctx, x + 30, bodyY + 10, 40, "255,230,160", 0.25);
      });
      ctx.restore();
    },
  };
};

// 17. The Pensieve: silvery memories spiralling slowly round a bright centre.
const pensieve: Maker = (w, h, pal, q) => {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const R = Math.hypot(w, h) * 0.55;
  const silver = pal.light ? "90,100,140" : "200,215,255";
  const blue = pal.light ? "70,90,150" : "140,170,255";
  const arms = 3;
  const motes = Array.from({ length: count(220, q) }, () => {
    const arm = Math.floor(rand(0, arms));
    const r = rand(20, R);
    return { arm, r, jitter: rand(-0.35, 0.35), size: rand(0.8, 2.6), p: rand(0, TAU), tint: Math.random() < 0.3 };
  });
  const threads = Array.from({ length: count(7, q) }, () => ({ r: rand(60, R * 0.8), a: rand(0, TAU), len: rand(0.6, 1.6), v: rand(0.05, 0.12) }));
  return {
    step(ctx, f) {
      const spin = f.t * 0.06;
      const o = parallax(f, 0.3);
      additive(ctx, pal, () => {
        glow(ctx, cx + o.x, cy + o.y, 220, blue, 0.08);
        glow(ctx, cx + o.x, cy + o.y, 50, silver, 0.22);
        for (const m of motes) {
          m.r -= (6 + m.r * 0.02) * f.dt;
          if (m.r < 12) m.r = R;
          const angle = spin + (m.arm / arms) * TAU + Math.log(m.r) * 1.6 + m.jitter;
          const x = cx + o.x + Math.cos(angle) * m.r;
          const y = cy + o.y + Math.sin(angle) * m.r * 0.62;
          const fade = clamp(m.r / 60, 0, 1) * clamp((R - m.r) / 120, 0, 1);
          glow(ctx, x, y, m.size * 2.8, m.tint ? blue : silver, (0.4 + 0.35 * Math.sin(f.t * 1.5 + m.p)) * fade, true);
        }
        ctx.lineWidth = 1.2;
        for (const th of threads) {
          th.a += th.v * f.dt;
          ctx.strokeStyle = `rgba(${silver},0.12)`;
          ctx.beginPath();
          ctx.ellipse(cx + o.x, cy + o.y, th.r, th.r * 0.62, 0, th.a, th.a + th.len);
          ctx.stroke();
        }
      });
    },
  };
};

// 18. The Time-Turner: golden sand falling in streams, turning back on itself, under turning rings.
const timeTurner: Maker = (w, h, pal, q) => {
  const gold = pal.light ? "150,105,20" : "255,210,110";
  const streams = Array.from({ length: Math.max(3, Math.round(5 * q)) }, (_, i) => ({ x: ((i + 0.5) / Math.max(3, Math.round(5 * q))) * w + rand(-40, 40) }));
  const grains = Array.from({ length: count(320, q) }, () => {
    const s = streams[Math.floor(rand(0, streams.length))];
    return { s, y: rand(0, h), dx: rand(-1, 1) ** 3 * 22, v: rand(50, 150), size: rand(0.7, 2.2), p: rand(0, TAU) };
  });
  const glitter = Array.from({ length: count(40, q) }, () => ({ x: rand(0, w), y: rand(0, h), p: rand(0, TAU), v: rand(3, 9) }));
  let direction = 1;
  let turn = 0;
  let next = rand(6, 10);
  return {
    step(ctx, f) {
      next -= f.dt;
      if (next <= 0) {
        direction = -direction;
        turn = 1;
        next = rand(7, 12);
      }
      const ease = 1 - turn;
      turn = Math.max(0, turn - f.dt * 0.8);
      const o = parallax(f, 0.25);
      // The Time-Turner's rings, turning slowly in the background.
      ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) {
        const r = Math.min(w, h) * (0.22 + i * 0.09);
        ctx.strokeStyle = `rgba(${gold},${0.025 + 0.06 * turn})`;
        ctx.beginPath();
        ctx.ellipse(w / 2 + o.x, h / 2 + o.y, r, r * Math.abs(Math.cos(f.t * 0.15 + i * 1.1)) + 4, f.t * 0.05 * (i % 2 ? -1 : 1), 0, TAU);
        ctx.stroke();
      }
      additive(ctx, pal, () => {
        for (const g of grains) {
          g.y += g.v * direction * ease * f.dt;
          g.y = wrap(g.y, -10, h + 10);
          const x = g.s.x + g.dx + Math.sin(g.y * 0.012 + f.t * 0.6 + g.s.x) * 26 + Math.sin(g.y * 0.05 + g.p) * 3;
          glow(ctx, x, g.y, g.size * 2.4, gold, 0.35 + 0.3 * Math.sin(f.t * 3 + g.p), true);
        }
        for (const gl of glitter) {
          gl.y = wrap(gl.y - gl.v * f.dt, -10, h + 10);
          glow(ctx, gl.x, gl.y, 3.5, gold, 0.5 * Math.max(0, Math.sin(f.t * 1.2 + gl.p)) ** 4, true);
        }
        if (turn > 0) glow(ctx, w / 2, h / 2, Math.min(w, h) * 0.6 * (1 - turn) + 40, gold, 0.18 * turn);
      });
    },
  };
};

export const MAGIC: Record<string, Maker> = {
  patronus,
  snitch,
  floo,
  fawkes,
  lake,
  express,
  pensieve,
  "time-turner": timeTurner,
};
