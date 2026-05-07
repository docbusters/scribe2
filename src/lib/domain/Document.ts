import type { Section } from "./Section.ts";

export interface Document {
    title: string;
    sections: Section[];
}
