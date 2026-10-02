import { useEffect, useRef } from "react";
import { TRACKS, shuffleOrder } from "../engine/music";
import { useGame } from "../engine/store";

/** Seconds to fade the music in or out. */
const FADE = 2.5;

/**
 * Plays the tracks in `music/` quietly in the background, shuffled and
 * looping, with no visible player. Browsers only allow sound after the player
 * has clicked or typed something, so it starts (with a gentle fade-in) on the
 * first interaction. It fades out while the tab is hidden, and whenever it's
 * switched off.
 */
export function BackgroundMusic() {
  const { enabled, volume } = useGame((s) => s.music);
  const audio = useRef<HTMLAudioElement | null>(null);
  const target = useRef(0);
  const started = useRef(false);
  const loudest = useRef(0.15);

  // One audio element for the whole game, stepping through a shuffled order.
  useEffect(() => {
    if (TRACKS.length === 0) return;
    const el = new Audio();
    el.preload = "auto";
    el.volume = 0;
    audio.current = el;
    let order = shuffleOrder(TRACKS.length, null);
    let at = 0;
    const load = () => {
      el.src = TRACKS[order[at]].src;
    };
    el.addEventListener("ended", () => {
      at += 1;
      if (at >= order.length) {
        order = shuffleOrder(TRACKS.length, order[order.length - 1]);
        at = 0;
      }
      load();
      void el.play().catch(() => undefined);
    });
    load();
    return () => {
      el.pause();
      el.src = "";
      audio.current = null;
    };
  }, []);

  // Fade the volume towards its target every frame (fades in, fades out, and follows the slider).
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const el = audio.current;
      const dt = (now - last) / 1000;
      last = now;
      if (el) {
        const goal = target.current;
        if (goal > 0) loudest.current = goal;
        // Fades take FADE seconds whatever the volume, so even quiet music eases in.
        const step = (dt * Math.max(0.02, loudest.current)) / FADE;
        el.volume = Math.max(0, Math.min(1, el.volume + Math.max(-step, Math.min(step, goal - el.volume))));
        if (goal === 0 && el.volume === 0 && !el.paused) el.pause();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Start after the first click or key press, and follow the on/off switch, the volume and the tab's visibility.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const apply = () => {
      const audible = enabled && !document.hidden && started.current;
      target.current = audible ? (volume / 100) * 0.6 : 0;
      if (audible && el.paused) void el.play().catch(() => undefined);
    };
    const begin = () => {
      started.current = true;
      apply();
    };
    if (navigator.userActivation?.hasBeenActive) started.current = true;
    apply();
    window.addEventListener("pointerdown", begin, { once: true, capture: true });
    window.addEventListener("keydown", begin, { once: true, capture: true });
    document.addEventListener("visibilitychange", apply);
    return () => {
      window.removeEventListener("pointerdown", begin, true);
      window.removeEventListener("keydown", begin, true);
      document.removeEventListener("visibilitychange", apply);
    };
  }, [enabled, volume]);

  return null;
}

/** The little 🎵 switch in the header. Hidden when there's no music to play. */
export function MusicToggle() {
  const enabled = useGame((s) => s.music.enabled);
  const setMusic = useGame((s) => s.setMusic);
  if (TRACKS.length === 0) return null;
  return (
    <button
      className={`btn ghost small music-toggle ${enabled ? "" : "off"}`}
      onClick={() => setMusic({ enabled: !enabled })}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn the music off" : "Turn the music on"}
      title={enabled ? "Music on" : "Music off"}
      data-testid="music-toggle"
    >
      {enabled ? "🎵" : "🔇"}
    </button>
  );
}
