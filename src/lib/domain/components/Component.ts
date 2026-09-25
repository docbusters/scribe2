import type { DataValue } from "../data/DataValue.js";

export interface ComponentConfig {
    [key: string]: unknown;
}

export interface BaseComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> {
    id: string;
    type: T;
    mode: 'inline' | 'block';
    value: V;
    config?: P;
}

export interface InlineComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> extends BaseComponent<T, V, P> {
    mode: 'inline';
}

export interface BlockComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> extends BaseComponent<T, V, P> {
    mode: 'block';
}

/** Metadata attached to synthetic ghost placeholder components during editing */
export interface GhostComponentMeta {
    insertAfterId?: string | null;
    insertBeforeId?: string | null;
    isBetweenBlocks?: boolean;
}
