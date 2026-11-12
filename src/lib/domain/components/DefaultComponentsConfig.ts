import type { ComponentConfig } from "./Component.ts";

export interface TextInputComponentConfig extends ComponentConfig {
    placeholder?: string;
    /** If true, the input will expand to fit its content */
    expandWithContent?: boolean;
}

export interface ImageComponentConfig extends ComponentConfig {
    emptyText?: string;
    errorText?: string;
    /** Applies cover by default */
    position?: 'contain' | 'cover' | 'fill';
    align?: 'left' | 'center' | 'right';
    width?: string;
    height?: string;
}

export interface LatexComponentConfig extends ComponentConfig {
    emptyText?: string;
    errorText?: string;
}

export interface TableComponentConfig extends ComponentConfig {
    /** Total number of columns */
    cols: number;
    /** Total number of rows */
    rows: number;
    /** Draws the borders of the table and its cells. Borders are shown unless it is false */
    showBorders?: boolean;
}

export interface QrComponentConfig extends ComponentConfig {
    /** The shape of the dots of the code: `dots` are circles. Square dots are drawn by default */
    dotsType?: 'square' | 'rounded' | 'dots' | 'classy';
    /** Colour of the dots, as `#rrggbb`. Black by default. Anything else is ignored */
    dotsColor?: string;
    /** The shape of the three corners (frame and centre). `dots` is circular. The library has no classy corners. Square by default */
    cornersType?: 'square' | 'rounded' | 'dots';
    /** Colour of the corners, as `#rrggbb`. Black by default. Anything else is ignored */
    cornersColor?: string;
    /** Colour of the background of the code, quiet zone included, as `#rrggbb`. White by default. Anything else is ignored */
    backgroundColor?: string;
}

export interface MapComponentConfig extends ComponentConfig {
    initialZoom?: number;
    initialPosition?: { lat: number; lng: number };
    markerColor?: string;
    readonly?: boolean;
    hasSearchbar?: boolean;
    hasGlobeBtn?: boolean;
    hasZoomBtn?: boolean;
    hasCurrentPosBtn?: boolean;
    isMarkerDraggable?: boolean;
}

export interface ChartComponentConfig extends ComponentConfig {
    type: 'bar' | 'line' | 'area' | 'pie' | 'arc';
    xAxisKey?: string;
    series: { key: string; label: string; color?: string; hidden?: boolean }[];
}
