import type { BaseComponent, ComponentConfig, SlotRef } from '../domain/components/Component.js';
import type { ComponentValue, DataValue, RecordValue } from '../domain/data/DataValue.js';

type AnyComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

/** The components of a section or of a slot, in order */
export type ContentEntries = [id: string, component: AnyComponent][];

/**
 * Reads the components of a slot, in order. The slot is the entry `slotKey` of the record value of its parent:
 * a record of components keyed by their ids. An empty slot is not stored, so a missing entry is an empty list.
 * Returns null when the parent value is not a record or the entry is not a record of components.
 */
export function readSlotEntries(parentValue: DataValue, slotKey: string): ContentEntries | null {
    if (parentValue?.type !== 'record') return null;

    const slot = (parentValue.value as Record<string, DataValue | undefined>)[slotKey];
    if (slot === undefined) return [];
    if (slot.type !== 'record') return null;

    const entries: ContentEntries = [];
    for (const [id, item] of Object.entries(slot.value as Record<string, DataValue>)) {
        if (item.type !== 'component') return null;
        entries.push([id, item.value]);
    }
    return entries;
}

/** Builds the value that stores the components of a slot, keyed by their ids */
export function toSlotValue(entries: ContentEntries): RecordValue<string, ComponentValue> {
    return {
        type: 'record',
        value: Object.fromEntries(entries.map(([id, component]) => [id, { type: 'component', value: component } satisfies ComponentValue]))
    };
}

/** Finds the slot of the components of a value (at any depth) that holds the component with the given id */
function findSlotInValue(parentId: string, value: DataValue, componentId: string): SlotRef | undefined {
    if (value?.type !== 'record') return undefined;

    for (const [slotKey, slot] of Object.entries(value.value as Record<string, DataValue>)) {
        if (slot?.type !== 'record') continue;

        const slotContent = slot.value as Record<string, DataValue>;
        if (slotContent[componentId]?.type === 'component') {
            return { parentId, slotKey };
        }

        // The component can be deeper, inside a slot of one of the components of this slot
        for (const item of Object.values(slotContent)) {
            if (item.type !== 'component') continue;
            const found = findSlotInValue(item.value.id, item.value.value, componentId);
            if (found) return found;
        }
    }
    return undefined;
}

/**
 * Finds where a component is stored, given the content of its section: null when it is in the content itself, the slot that
 * holds it when it is nested, or undefined when it is not there. Components nested in other ways (an array...) are not found
 */
export function findSlotOf(content: Record<string, AnyComponent>, componentId: string): SlotRef | null | undefined {
    if (content[componentId]) return null;

    for (const component of Object.values(content)) {
        const found = findSlotInValue(component.id, component.value, componentId);
        if (found) return found;
    }
    return undefined;
}

/**
 * Keys the components of every slot inside a value by their current ids, at any depth. It must run after the ids
 * of a cloned component are changed, as a slot is keyed by the ids of its components
 */
export function rekeySlotContents(value: DataValue): void {
    if (!value) return;

    if (value.type === 'component') {
        rekeySlotContents(value.value.value);
    } else if (value.type === 'array') {
        for (const item of value.value as DataValue[]) rekeySlotContents(item);
    } else if (value.type === 'record') {
        const items = Object.values(value.value as Record<string, DataValue>);
        for (const item of items) rekeySlotContents(item);

        // A record of components is the content of a slot
        if (items.length > 0 && items.every(item => item.type === 'component')) {
            value.value = Object.fromEntries(
                (items as ComponentValue[]).map(item => [item.value.id, item])
            );
        }
    }
}
