import { useEffect } from "react";
import { useGame } from "../engine/store";
import { grantBadge } from "../lore/applyEggs";
import { KONAMI } from "../lore/easterEggs";
import { useFx } from "../engine/store";
import { python } from "../runtime/pythonRunner";
import { Effects } from "./Effects";
import { Header } from "./Header";
import { MapView } from "./MapView";
import { QuestView } from "./QuestView";
import { useRoute } from "./router";
import { MaraudersMap, Page394, Platform934 } from "./SecretPages";
import { Settings } from "./Settings";
import { Sorting } from "./Sorting";
import { Spellbook } from "./Spellbook";
import { Trophies } from "./Trophies";
import { Welcome } from "./Welcome";

export default function App() {
  const name = useGame((s) => s.name);
  const house = useGame((s) => s.house);
  const theme = useGame((s) => s.theme);
  const route = useRoute();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.house = house ?? "";
  }, [theme, house]);

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
      case "quest":
        body = <QuestView key={route.id} questId={route.id} />;
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

  return (
    <>
      {name && house && <Header />}
      <main className="main">{body}</main>
      <Effects />
    </>
  );
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
