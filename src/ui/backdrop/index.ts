import type { Preset } from "../../engine/ambience";
import { CLASSIC } from "./classic";
import type { Maker } from "./engine";
import { MAGIC } from "./magic";
import { BANNER_MAKERS } from "./banners";

/** Every preset's scene builder, by id. */
export const MAKERS = { ...CLASSIC, ...MAGIC, ...BANNER_MAKERS } as Record<Preset, Maker>;
