import type { ExtractBlock, ExtractInline } from "./components/Component.ts";

export type Section = ParagraphSection | BlockSection | GridSection;

export interface ParagraphSection {
    type: "paragraph-section";
    title: string;
    content: ExtractInline<>[]; // Only admits inline components
}

export interface BlockSection {
    type: "block-section";
    title: string;
    content: ExtractBlock<>; // Only admits block components
}

export interface GridSection {
    type: "grid-section";
    title: string;
    rows: number;
    columns: number;
    content: {
        row: number;
        rowspan?: number;
        column: number;
        colspan?: number;
        section: Section; // Allows section nesting!
    };
}
