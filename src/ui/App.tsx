import { useEffect } from "react";
import { lessonById, YEARS } from "../engine/content";
import { currentYear, paletteYear } from "../engine/progress";
import { useFx, useGame } from "../engine/store";
import { grantBadge } from "../lore/applyEggs";
import { KONAMI } from "../lore/easterEggs";
import { python } from "../runtime/pythonRunner";
import { Ambience } from "./Ambience";
import { BackgroundMusic } from "./BackgroundMusic";
import { CaseFile } from "./CaseFile";
import { SceneHost } from "./Cutscene";
import { DuelingClub } from "./DuelingClub";
import { Effects } from "./Effects";
import { Header } from "./Header";
import { LessonView } from "./LessonView";
import { LevelUpHost } from "./LevelUp";
import { MapView } from "./MapView";
import { useRoute, type Route } from "./router";
import { MaraudersMap, Page394, Platform934 } from "./SecretPages";
import { Settings } from "./Settings";
import { Shop } from "./Shop";
import { Sorting } from "./Sorting";
import { Spellbook } from "./Spellbook";
import { TimeTurner } from "./TimeTurner";
import { Trophies } from "./Trophies";
import { Welcome } from "./Welcome";

export default function App() {
  const name = useGame((s) => s.name);
  const house = useGame((s) => s.house);
  const theme = useGame((s) => s.theme);
  const route = useRoute();
  const year = useYearOnScreen(route);
  const castleColours = useGame((s) => s.castleColours);
  const reached = useGame((s) => currentYear(YEARS, s.exercises, s.skipped));
  const paletteFrom = paletteYear(castleColours, year, reached);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.house = house ?? "";
    root.dataset.year = String(year);
    // The background pattern belongs to the palette, so it follows the chosen castle colours.
    root.dataset.palette = String(paletteFrom);
    // Each year has its own palette. In the light (Lumos) theme only the
    // accents change, so text stays readable on parchment.
    const t = YEARS.find((y) => y.year === paletteFrom)?.theme;
    const vars: Record<string, string | undefined> =
      theme === "dark" && t
        ? { "--gold": t.gold, "--gold-2": t.gold2, "--bg": t.bg, "--bg-2": t.bg2, "--card": t.card, "--card-2": t.card2, "--line": t.line }
        : { "--gold": undefined, "--gold-2": undefined, "--bg": undefined, "--bg-2": undefined, "--card": undefined, "--card-2": undefined, "--line": undefined };
    for (const [k, v] of Object.entries(vars)) {
      if (v) root.style.setProperty(k, v);
      else root.style.removeProperty(k);
    }
  }, [theme, house, year, paletteFrom]);

  // Start waking Python up as soon as the student has a name.
  useEffect(() => {
    if (name) void python.warmUp().catch(() => undefined);
  }, [name]);

  useKonamiCode();

  let body;
  if (!name) body = <Welcome />;
  else if (!house) body = <Sorting />;
  else {
    switch (route.page) {
      case "lesson":
        body = <LessonView key={route.id} lessonId={route.id} />;
        break;
      case "casefile":
        body = <CaseFile />;
        break;
      case "spellbook":
        body = <Spellbook />;
        break;
      case "trophies":
        body = <Trophies />;
        break;
      case "settings":
        body = <Settings />;
        break;
      case "shop":
        body = <Shop />;
        break;
      case "time-turner":
        body = <TimeTurner />;
        break;
      case "dueling-club":
        body = <DuelingClub />;
        break;
      case "platform":
        body = <Platform934 />;
        break;
      case "marauder":
        body = <MaraudersMap />;
        break;
      case "page394":
        body = <Page394 />;
        break;
      default:
        body = <MapView />;
    }
  }

  const sceneKey = route.page === "lesson" ? `lesson:${route.id}` : route.page;

  return (
    <>
      <Ambience sceneKey={sceneKey} />
      <BackgroundMusic />
      {name && house && <Header />}
      <main className="main">{body}</main>
      <Effects />
      <SceneHost />
      <LevelUpHost />
    </>
  );
}

/** The year whose theme is shown: the lesson's year, or the latest year reached. */
function useYearOnScreen(route: Route): number {
  const exercises = useGame((s) => s.exercises);
  const skipped = useGame((s) => s.skipped);
  if (route.page === "lesson") {
    const lesson = lessonById(route.id);
    if (lesson) return lesson.year;
  }
  return currentYear(YEARS, exercises, skipped);
}

function useKonamiCode() {
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        useFx.getState().play("fireworks");
        useFx.getState().toast("🎆 Fred and George's fireworks explode across the Great Hall! Mischief approved.", "egg");
        useGame.getState().foundEgg("wheezes");
        grantBadge("wheezes");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
