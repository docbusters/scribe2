export type Section<C> = ParagraphSection<C> | GridSection<C>;

/** Contains a list of inline components */
export interface ParagraphSection<C> {
    id: string;
    type: "paragraph-section";
    title: string;
    content: Record<string, C>; // Admits components defined in C
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
