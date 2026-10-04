import { useEffect, useState } from "react";
import { loadLessonText, type LessonText } from "../engine/content";

/** The lectures and Spellbook pages of these lessons, or null while they load. */
export function useLessonTexts(ids: string[]): Record<string, LessonText> | null {
  const key = ids.join(",");
  const [texts, setTexts] = useState<{ key: string; value: Record<string, LessonText> } | null>(null);
  useEffect(() => {
    let live = true;
    void Promise.all(ids.map((id) => loadLessonText(id).then((t) => [id, t] as const))).then((pairs) => {
      if (live) setTexts({ key, value: Object.fromEntries(pairs) });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return texts?.key === key ? texts.value : null;
}
