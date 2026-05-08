import type { DefaultComponents } from "../registry/defaultRegistry.js";
import type { Section } from "./Section.js";

export interface Document<C = never> {
    title: string;
    /** Separation in pixels between sections */
    sectionSeparation?: number;
    sections: Section<DefaultComponents | C>[];
}
