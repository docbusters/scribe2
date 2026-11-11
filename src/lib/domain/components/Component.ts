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
    /** Height in px chosen by the user. Only used by components whose registry entry defines a height; otherwise its default is used */
    height?: number;
}

/**
 * An editable area inside a component, filled with components like a section. The parent holds it in the record that is
 * its value: the entry `slotKey` is a record of components keyed by their ids (see ComponentSlot)
 */
export interface SlotRef {
    /** Id of the component that holds the slot */
    parentId: string;
    /** Key of the slot in the record value of the parent */
    slotKey: string;
}

/** Metadata attached to synthetic ghost placeholder components during editing */
export interface GhostComponentMeta {
    insertAfterId?: string | null;
    insertBeforeId?: string | null;
    isBetweenBlocks?: boolean;
    /** The slot the ghost is in, or null when it is in the content of the section */
    slot?: SlotRef | null;
}
