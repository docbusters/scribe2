import type { ExtractBlock, ExtractInline } from "./components/Component.js";

export type Section<C> = ParagraphSection<C> | BlockSection<C> | GridSection<C>;

/** Contains a list of inline components */
export interface ParagraphSection<C> {
    id: string;
    type: "paragraph-section";
    title: string;
    content: (ExtractInline<C> | ExtractBlock<C>)[]; // Admits inline and block components
}

/** Contains a single component that cannot be used inline */
export interface BlockSection<C> {
    id: string;
    type: "block-section";
    title: string;
    content: ExtractBlock<C>; // Only admits block components
}

/** Allows creating a grid layout with nested sections */
export interface GridSection<C> {
    id: string;
    type: "grid-section";
    title: string;
    rows: number;
    columns: number;
    gapX: number;
    gapY: number;
    content: GridSectionContent<C>[];
}

export interface GridSectionContent<C> {
    row: number;
    rowspan?: number;
    column: number;
    colspan?: number;
    section: Section<C>; // Allows section nesting!
}
