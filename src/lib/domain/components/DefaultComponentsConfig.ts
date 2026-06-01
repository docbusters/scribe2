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
}
