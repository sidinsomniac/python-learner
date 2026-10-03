// Editor themes from Flourish & Blotts with their own syntax colours. Each
// builds a CodeMirror theme plus a highlight style. Animated layers (footprints,
// ripples, fireflies...) are pure CSS in styles.css, under `.editor-<value>`.
// The four oldest themes (dungeon, starlight, parchment, ember) are CSS only.
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView, Prec, type Extension } from "@uiw/react-codemirror";
import type { HouseId } from "../lore/lore";

interface Palette {
  light: boolean;
  bg: string;
  fg: string;
  gutter: string;
  gutterFg: string;
  caret: string;
  selection: string;
  activeLine: string;
  keyword: string;
  string: string;
  number: string;
  comment: string;
  func: string;
  operator: string;
}

const HOUSE: Record<HouseId, Palette> = {
  gryffindor: {
    light: false, bg: "#2a0d0d", fg: "#f3dcc4", gutter: "#220909", gutterFg: "#a8766a", caret: "#ffcf5a", selection: "#7a2a1e88",
    activeLine: "#ffffff0a", keyword: "#ffc24a", string: "#ffb38a", number: "#ffd98a", comment: "#9a6a5a", func: "#ffe9b0", operator: "#e8a070",
  },
  slytherin: {
    light: false, bg: "#0b1f15", fg: "#d6e6dc", gutter: "#081810", gutterFg: "#6f8f7c", caret: "#c9d6cf", selection: "#2e5a4288",
    activeLine: "#ffffff0a", keyword: "#5fd38a", string: "#c9d6cf", number: "#e0e8a0", comment: "#5f7f6c", func: "#9fe8ff", operator: "#8fbfa4",
  },
  ravenclaw: {
    light: false, bg: "#0d1430", fg: "#d8def0", gutter: "#0a1026", gutterFg: "#6c76a0", caret: "#d9a066", selection: "#2a3a7a88",
    activeLine: "#ffffff0a", keyword: "#d9a066", string: "#9fc0ff", number: "#e8c08a", comment: "#5f6a96", func: "#f0e2cc", operator: "#a8b4e0",
  },
  hufflepuff: {
    light: false, bg: "#1f1a08", fg: "#f0e6c8", gutter: "#181406", gutterFg: "#8f8358", caret: "#f5d03a", selection: "#5a4a1088",
    activeLine: "#ffffff0a", keyword: "#f5d03a", string: "#e8d8a0", number: "#ffb84a", comment: "#857a52", func: "#fff2c0", operator: "#c8b878",
  },
};

const PALETTES: Record<string, Palette> = {
  map: {
    light: true, bg: "#ead9b0", fg: "#4a2f17", gutter: "#dcc697", gutterFg: "#8a6a45", caret: "#4a2f17", selection: "#b8935a66",
    activeLine: "#ffffff22", keyword: "#9a2010", string: "#2e7a2a", number: "#c0600a", comment: "#8a6a45", func: "#3a3ab0", operator: "#6a4a2a",
  },
  pensieve: {
    light: false, bg: "#0c1322", fg: "#d8e2f0", gutter: "#0a101d", gutterFg: "#5f6f8c", caret: "#e6f0ff", selection: "#3a4f7a88",
    activeLine: "#ffffff08", keyword: "#9ec5ff", string: "#8ff0e0", number: "#f0b0ff", comment: "#66789a", func: "#ffe9a8", operator: "#a8b8d8",
  },
  lake: {
    light: false, bg: "#061f1e", fg: "#cdeee6", gutter: "#051a19", gutterFg: "#4f7f78", caret: "#9be7d8", selection: "#1f5a5288",
    activeLine: "#ffffff08", keyword: "#5fd1c0", string: "#c5f58a", number: "#ffb38a", comment: "#4f7f78", func: "#ffd38a", operator: "#8fc8bc",
  },
  forest: {
    light: false, bg: "#0b1a10", fg: "#cfe3c4", gutter: "#08140c", gutterFg: "#5a7a55", caret: "#e8f59a", selection: "#2f4a2a88",
    activeLine: "#ffffff08", keyword: "#8fcf6a", string: "#f0c060", number: "#ff8a6a", comment: "#5a7a55", func: "#9ad8ff", operator: "#a8c89a",
  },
  wheezes: {
    light: false, bg: "#1d0f2a", fg: "#f0e2ff", gutter: "#170b22", gutterFg: "#8b6aa8", caret: "#ff8a2a", selection: "#5a2a7a88",
    activeLine: "#ffffff0a", keyword: "#ff8a2a", string: "#ffd23f", number: "#ff5fa2", comment: "#8b6aa8", func: "#7cf0ff", operator: "#ffa86a",
  },
  ministry: {
    light: false, bg: "#08251f", fg: "#d8ece4", gutter: "#061d18", gutterFg: "#5e8a7e", caret: "#e6c25a", selection: "#1f4a4088",
    activeLine: "#ffffff08", keyword: "#e6c25a", string: "#7fe0b0", number: "#ffd98a", comment: "#5e8a7e", func: "#9fd8ff", operator: "#b8d0c4",
  },
  honeydukes: {
    light: true, bg: "#fff3f7", fg: "#4a2a3a", gutter: "#ffe2ec", gutterFg: "#b07a92", caret: "#d0337a", selection: "#ffb3d066",
    activeLine: "#ffffff66", keyword: "#d0337a", string: "#2a8a6a", number: "#7a4ad0", comment: "#b08aa0", func: "#2a6ad0", operator: "#a0507a",
  },
};

/** The themes built here (the rest are CSS-only). */
export const CODED_THEMES = [...Object.keys(PALETTES), "house"];

function paletteFor(value: string, house: HouseId | null): Palette | null {
  if (value === "house") return HOUSE[house ?? "gryffindor"];
  return PALETTES[value] ?? null;
}

/** Light-coloured editor backgrounds, so effects drawn over them use dark ink. */
export function isLightEditor(value: string | undefined): boolean {
  if (!value) return false;
  return value === "parchment" || Boolean(PALETTES[value]?.light);
}

/** The CodeMirror theme and highlighting for `value`, or null if it's a CSS-only theme. */
export function editorTheme(value: string | undefined, house: HouseId | null): Extension | null {
  if (!value) return null;
  const p = paletteFor(value, house);
  if (!p) return null;
  const theme = EditorView.theme(
    {
      // The background lives on the wrapper (.editor-<value>), so CSS layers can animate behind the text.
      "&": { backgroundColor: "transparent", color: p.fg },
      ".cm-content": { caretColor: p.caret },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: p.caret },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: p.selection },
      ".cm-activeLine": { backgroundColor: p.activeLine },
      ".cm-gutters": { backgroundColor: p.gutter, color: p.gutterFg, border: "none" },
      ".cm-activeLineGutter": { backgroundColor: "transparent", color: p.fg },
    },
    { dark: !p.light },
  );
  const highlight = HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: p.keyword, fontWeight: "600" },
    { tag: [t.string, t.special(t.string)], color: p.string },
    { tag: [t.number, t.bool, t.null, t.atom], color: p.number },
    { tag: [t.comment, t.lineComment], color: p.comment, fontStyle: "italic" },
    { tag: [t.function(t.variableName), t.function(t.definition(t.variableName)), t.definition(t.className)], color: p.func },
    { tag: [t.operator, t.punctuation, t.bracket], color: p.operator },
    { tag: [t.variableName, t.propertyName], color: p.fg },
    { tag: t.self, color: p.keyword, fontStyle: "italic" },
  ]);
  // Highest precedence, so these colours win over the default highlighter in basicSetup.
  return [theme, Prec.highest(syntaxHighlighting(highlight))];
}

/** The wrapper's background colour, for the CSS layers to sit on. */
export function editorBackground(value: string | undefined, house: HouseId | null): string | undefined {
  return value ? paletteFor(value, house)?.bg : undefined;
}
