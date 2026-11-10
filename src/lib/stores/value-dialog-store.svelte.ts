import type { EmptyContentAction } from '../types/EmptyContentProps.js';
import type { ScribeMode } from '../types/ScribeProps.js';

/** The component whose value is being edited in the value dialog */
export interface ValueDialogTarget {
    sectionId: string;
    componentId: string;
}

/**
 * Opens the dialog that sets the value of a component. The dialog is rendered once by Scribe, so anything can open it:
 * the "Set value" button of the top toolbar and the buttons of the empty states of the components
 */
class ValueDialogStore {
    target = $state<ValueDialogTarget | null>(null);

    get isOpen() {
        return this.target !== null;
    }

    open(sectionId: string, componentId: string) {
        this.target = { sectionId, componentId };
    }

    close() {
        this.target = null;
    }

    /** The button of an empty state that opens the dialog for a component. Only in edit mode, as that is where a value can be set */
    getAction(mode: ScribeMode, sectionId: string, componentId: string, label: string): EmptyContentAction | undefined {
        if (mode !== 'edit') return undefined;
        return { label, onclick: () => this.open(sectionId, componentId) };
    }
}

export const valueDialogStore = new ValueDialogStore();
