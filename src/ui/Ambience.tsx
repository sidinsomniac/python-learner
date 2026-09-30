import { useEffect, useRef, useState } from "react";
import { pickPreset, type Preset } from "../engine/ambience";
import { useGame } from "../engine/store";

/**
 * The castle's living background: one canvas behind everything, drawing one
 * of ten weather presets. A new preset is picked (never the same twice in a
 * row) whenever `sceneKey` changes - i.e. each time a new screen opens.
 */
export function Ambience({ sceneKey }: { sceneKey: string }) {
  const enabled = useGame((s) => s.ambience);
  const reducedMotion = usePrefersReducedMotion();
  const [preset, setPreset] = useState<Preset | null>(null);

  useEffect(() => {
    setPreset((prev) => pickPreset(prev));
  }, [sceneKey]);

  if (!enabled || reducedMotion || !preset) return null;
  return <AmbienceCanvas key={preset} preset={preset} />;
}

function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => typeof matchMedia !== "undefined" && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

interface Palette {
  gold: string;
  gold2: string;
  light: boolean;
}

interface Scene {
  step: (ctx: CanvasRenderingContext2D, dt: number, t: number) => void;
}

type Maker = (w: number, h: number, pal: Palette) => Scene;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function AmbienceCanvas({ preset }: { preset: Preset }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const pal: Palette = {
      gold: css.getPropertyValue("--gold").trim() || "#d9b45a",
      gold2: css.getPropertyValue("--gold-2").trim() || "#f3d58a",
      light: document.documentElement.dataset.theme === "light",
    };
    let w = 0;
    let h = 0;
    let scene: Scene;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = MAKERS[preset](w, h, pal);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      scene.step(ctx, dt, now / 1000);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();
    const fadeIn = setTimeout(() => setVisible(true), 30);

    return () => {
      clearTimeout(fadeIn);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [preset]);

  return (
    <canvas
      ref={ref}
      className={`ambience ${visible ? "visible" : ""}`}
      data-preset={preset}
      data-testid="ambience"
      aria-hidden
    />
  );
}

// ---------------------------------------------------------------------------
// The ten presets. Each keeps at most ~80 particles.
// ---------------------------------------------------------------------------

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

function starField(w: number, h: number, n: number) {
  return Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h * 0.7), r: rand(0.4, 1.4), p: rand(0, 6) }));
}

function drawStars(ctx: CanvasRenderingContext2D, stars: ReturnType<typeof starField>, t: number, color: string) {
  ctx.fillStyle = color;
  for (const s of stars) {
    ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.p));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const MAKERS: Record<Preset, Maker> = {
  // 1. Floating candles under a twinkling ceiling.
  candles: (w, h, pal) => {
    const stars = starField(w, h, 45);
    const candles = Array.from({ length: 14 }, () => ({ x: rand(0, w), y: rand(h * 0.08, h * 0.6), p: rand(0, 6), s: rand(0.7, 1.2) }));
    return {
      step(ctx, _dt, t) {
        drawStars(ctx, stars, t, pal.light ? "#8a6414" : "#fff");
        for (const c of candles) {
          const y = c.y + Math.sin(t * 0.8 + c.p) * 8;
          const flicker = 0.8 + 0.2 * Math.sin(t * 9 + c.p * 3);
          glow(ctx, c.x, y - 16 * c.s, 26 * c.s * flicker, "rgba(255,190,90,0.8)", 0.35);
          ctx.fillStyle = pal.light ? "rgba(120,90,50,0.35)" : "rgba(245,235,215,0.55)";
          ctx.fillRect(c.x - 3 * c.s, y - 10 * c.s, 6 * c.s, 22 * c.s);
          ctx.fillStyle = `rgba(255,${200 + 30 * flicker},120,0.9)`;
          ctx.beginPath();
          ctx.ellipse(c.x, y - 15 * c.s, 2.2 * c.s, 5 * c.s * flicker, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  },

  // 2. Soft snowfall.
  snow: (w, h, pal) => {
    const flakes = Array.from({ length: 80 }, () => ({ x: rand(0, w), y: rand(-h, h), r: rand(1, 3.2), v: rand(18, 55), p: rand(0, 6) }));
    return {
      step(ctx, dt, t) {
        ctx.fillStyle = pal.light ? "rgba(120,140,170,0.55)" : "rgba(255,255,255,0.8)";
        for (const f of flakes) {
          f.y += f.v * dt;
          f.x += Math.sin(t * 0.7 + f.p) * 18 * dt;
          if (f.y > h + 5) {
            f.y = -5;
            f.x = rand(0, w);
          }
          ctx.globalAlpha = 0.35 + f.r / 5;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    };
  },

  // 3. Slanted rain with distant lightning.
  storm: (w, h, pal) => {
    const drops = Array.from({ length: 75 }, () => ({ x: rand(0, w * 1.3), y: rand(-h, h), l: rand(10, 22), v: rand(520, 760) }));
    let flash = 0;
    let nextFlash = rand(4, 9);
    return {
      step(ctx, dt) {
        nextFlash -= dt;
        if (nextFlash <= 0) {
          flash = 1;
          nextFlash = rand(6, 12);
        }
        if (flash > 0) {
          ctx.fillStyle = `rgba(200,215,255,${0.18 * flash})`;
          ctx.fillRect(0, 0, w, h);
          flash = Math.max(0, flash - dt * 2.5);
        }
        ctx.strokeStyle = pal.light ? "rgba(70,90,130,0.35)" : "rgba(170,190,230,0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const d of drops) {
          d.y += d.v * dt;
          d.x -= d.v * 0.25 * dt;
          if (d.y > h) {
            d.y = rand(-40, 0);
            d.x = rand(0, w * 1.3);
          }
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.l * 0.25, d.y - d.l);
        }
        ctx.stroke();
      },
    };
  },

  // 4. Embers rising from the Goblet of Fire.
  embers: (w, h) => {
    const make = () => ({ x: rand(0, w), y: h + rand(0, 60), v: rand(25, 70), life: rand(3, 8), age: 0, p: rand(0, 6), r: rand(1, 2.6) });
    const embers = Array.from({ length: 55 }, () => ({ ...make(), age: rand(0, 6) }));
    return {
      step(ctx, dt, t) {
        for (const e of embers) {
          e.age += dt;
          e.y -= e.v * dt;
          e.x += Math.sin(t * 1.3 + e.p) * 14 * dt;
          if (e.age > e.life || e.y < -10) Object.assign(e, make());
          const a = Math.sin((e.age / e.life) * Math.PI);
          glow(ctx, e.x, e.y, e.r * 5, "rgba(255,140,40,0.9)", 0.35 * a);
          ctx.fillStyle = `rgba(255,${170 + 60 * a},90,${0.8 * a})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  },

  // 5. Slow-drifting Dementor mist.
  mist: (w, h, pal) => {
    const banks = Array.from({ length: 9 }, () => ({ x: rand(-w * 0.2, w), y: rand(h * 0.2, h), r: rand(180, 380), v: rand(6, 18), p: rand(0, 6) }));
    return {
      step(ctx, dt, t) {
        for (const b of banks) {
          b.x += b.v * dt;
          if (b.x - b.r > w) b.x = -b.r;
          glow(ctx, b.x, b.y + Math.sin(t * 0.2 + b.p) * 20, b.r, pal.light ? "rgba(120,120,140,0.5)" : "rgba(200,210,230,0.5)", 0.1);
        }
      },
    };
  },

  // 6. Fireflies of the Forbidden Forest.
  fireflies: (w, h) => {
    const flies = Array.from({ length: 34 }, () => ({ x: rand(0, w), y: rand(h * 0.2, h), a: rand(0, 6), v: rand(12, 30), p: rand(0, 6) }));
    return {
      step(ctx, dt, t) {
        for (const f of flies) {
          f.a += rand(-1.5, 1.5) * dt;
          f.x = (f.x + Math.cos(f.a) * f.v * dt + w) % w;
          f.y = Math.min(h, Math.max(h * 0.1, f.y + Math.sin(f.a) * f.v * dt));
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + f.p);
          glow(ctx, f.x, f.y, 14, "rgba(200,255,120,0.9)", 0.35 * pulse);
          ctx.fillStyle = `rgba(230,255,160,${0.5 + 0.5 * pulse})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };
  },

  // 7. Autumn leaves tumbling across the grounds.
  leaves: (w, h) => {
    const colours = ["#c8642a", "#d99a2b", "#a8402a", "#8f6a2a"];
    const leaves = Array.from({ length: 26 }, () => ({ x: rand(0, w), y: rand(-h, h), v: rand(25, 50), rot: rand(0, 6), spin: rand(-2, 2), p: rand(0, 6), c: colours[Math.floor(rand(0, colours.length))], s: rand(5, 9) }));
    return {
      step(ctx, dt, t) {
        for (const l of leaves) {
          l.y += l.v * dt;
          l.x += (Math.sin(t * 0.9 + l.p) * 30 + 12) * dt;
          l.rot += l.spin * dt;
          if (l.y > h + 10) {
            l.y = -10;
            l.x = rand(-50, w);
          }
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot);
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = l.c;
          ctx.beginPath();
          ctx.ellipse(0, 0, l.s, l.s * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      },
    };
  },

  // 8. Aurora ribbons and lens flares.
  aurora: (w, h, pal) => {
    const ribbons = [
      { y: h * 0.18, c: "rgba(90,255,190,", a: 40, f: 0.004, s: 0.25 },
      { y: h * 0.26, c: "rgba(140,120,255,", a: 55, f: 0.003, s: 0.18 },
      { y: h * 0.34, c: "rgba(80,200,255,", a: 35, f: 0.005, s: 0.3 },
    ];
    const flares = Array.from({ length: 3 }, () => ({ x: rand(0, w), y: rand(0, h * 0.5), v: rand(8, 16), r: rand(40, 90) }));
    return {
      step(ctx, dt, t) {
        for (const r of ribbons) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 16) {
            const y = r.y + Math.sin(x * r.f + t * r.s) * r.a + Math.sin(x * r.f * 2.3 - t * r.s * 1.7) * r.a * 0.4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineWidth = 36;
          ctx.strokeStyle = r.c + (pal.light ? "0.08)" : "0.12)");
          ctx.stroke();
          ctx.lineWidth = 8;
          ctx.strokeStyle = r.c + "0.12)";
          ctx.stroke();
        }
        for (const f of flares) {
          f.x = (f.x + f.v * dt) % (w + f.r * 2);
          glow(ctx, f.x - f.r, f.y, f.r, pal.gold2, 0.12);
        }
      },
    };
  },

  // 9. Shooting stars from the Astronomy Tower.
  "shooting-stars": (w, h, pal) => {
    const stars = starField(w, h, 60);
    let shot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let wait = rand(0.5, 2);
    return {
      step(ctx, dt, t) {
        drawStars(ctx, stars, t, pal.light ? "#6d4c0c" : "#fff");
        wait -= dt;
        if (!shot && wait <= 0) shot = { x: rand(w * 0.2, w), y: rand(0, h * 0.3), vx: -rand(500, 800), vy: rand(180, 300), life: 1 };
        if (shot) {
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
          shot.life -= dt * 1.1;
          const tail = ctx.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 0.15, shot.y - shot.vy * 0.15);
          tail.addColorStop(0, `rgba(255,255,255,${Math.max(0, shot.life)})`);
          tail.addColorStop(1, "transparent");
          ctx.strokeStyle = tail;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shot.x, shot.y);
          ctx.lineTo(shot.x - shot.vx * 0.15, shot.y - shot.vy * 0.15);
          ctx.stroke();
          if (shot.life <= 0) {
            shot = null;
            wait = rand(1.5, 4);
          }
        }
      },
    };
  },

  // 10. Owl Post: paper aeroplanes and drifting feathers.
  "owl-post": (w, h, pal) => {
    const planes = Array.from({ length: 6 }, () => ({ x: rand(-w, w), y: rand(h * 0.1, h * 0.8), v: rand(40, 80), p: rand(0, 6), s: rand(8, 13) }));
    const feathers = Array.from({ length: 12 }, () => ({ x: rand(0, w), y: rand(-h, h), v: rand(12, 26), p: rand(0, 6), rot: rand(0, 6) }));
    return {
      step(ctx, dt, t) {
        const paper = pal.light ? "rgba(90,70,40,0.4)" : "rgba(240,232,210,0.55)";
        for (const p of planes) {
          p.x += p.v * dt;
          if (p.x > w + 30) {
            p.x = -30;
            p.y = rand(h * 0.1, h * 0.8);
          }
          const y = p.y + Math.sin(t * 0.9 + p.p) * 20;
          const tilt = Math.cos(t * 0.9 + p.p) * 0.25;
          ctx.save();
          ctx.translate(p.x, y);
          ctx.rotate(tilt);
          ctx.fillStyle = paper;
          ctx.beginPath();
          ctx.moveTo(p.s * 1.4, 0);
          ctx.lineTo(-p.s, -p.s * 0.6);
          ctx.lineTo(-p.s * 0.5, 0);
          ctx.lineTo(-p.s, p.s * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        for (const f of feathers) {
          f.y += f.v * dt;
          f.x += Math.sin(t + f.p) * 20 * dt;
          f.rot = Math.sin(t * 1.3 + f.p) * 0.8;
          if (f.y > h + 20) {
            f.y = -20;
            f.x = rand(0, w);
          }
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rot);
          ctx.strokeStyle = paper;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.quadraticCurveTo(4, 0, 0, 9);
          ctx.moveTo(0, -9);
          ctx.quadraticCurveTo(-4, 0, 0, 9);
          ctx.stroke();
          ctx.restore();
        }
      },
    };
  },
};
