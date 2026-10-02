import type { Preset } from "../../engine/ambience";
import { CLASSIC } from "./classic";
import type { Maker } from "./engine";
import { MAGIC } from "./magic";

/** Every preset's scene builder, by id. */
export const MAKERS = { ...CLASSIC, ...MAGIC } as Record<Preset, Maker>;
