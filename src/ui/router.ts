import { useEffect, useState } from "react";

export type Route =
  | { page: "map" }
  | { page: "lesson"; id: string }
  | { page: "casefile" }
  | { page: "shop" }
  | { page: "time-turner" }
  | { page: "dueling-club" }
  | { page: "spellbook" }
  | { page: "trophies" }
  | { page: "settings" }
  | { page: "platform" }
  | { page: "marauder" }
  | { page: "page394" };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  switch (parts[0]) {
    case "lesson":
      return parts[1] ? { page: "lesson", id: decodeURIComponent(parts[1]) } : { page: "map" };
    case "casefile":
      return { page: "casefile" };
    case "shop":
      return { page: "shop" };
    case "time-turner":
      return { page: "time-turner" };
    case "dueling-club":
      return { page: "dueling-club" };
    case "spellbook":
      return parts[1] === "394" ? { page: "page394" } : { page: "spellbook" };
    case "trophies":
      return { page: "trophies" };
    case "settings":
      return { page: "settings" };
    case "platform-nine-and-three-quarters":
      return { page: "platform" };
    case "marauders-map":
      return { page: "marauder" };
    default:
      return { page: "map" };
  }
}

export const go = (path: string) => {
  window.location.hash = path;
};

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
