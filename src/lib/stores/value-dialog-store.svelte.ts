import type { EmptyContentAction } from '../types/EmptyContentProps.js';
import type { ScribeMode } from '../types/ScribeProps.js';

/** The component whose value is being edited in the value dialog */
export interface ValueDialogTarget {
    sectionId: string;
    componentId: string;
}

/** The picker step of the dialog, opened by the value selector of a custom binding that has a `renderPicker` */
export interface ValueDialogPicker {
    bindingType: string;
    /** Type of the component being edited, to know which items it accepts */
    componentType: string;
    /** The pending choice of the selector that opened the step, or null */
    selectedId: string | null;
    /** Called with a validated id: the selector keeps it as the pending value, nothing is applied */
    onpick: (id: string) => void;
    /** Called when the step ends however it ends, so the selector that opened it gets the focus back */
    onclose: () => void;
}

/**
 * Opens the dialog that sets the value of a component. The dialog is rendered once by Scribe, so anything can open it:
 * the "Set value" button of the top toolbar and the buttons of the empty states of the components
 */
class ValueDialogStore {
    target = $state<ValueDialogTarget | null>(null);
    /** The picker step, or null while the dialog shows the normal content. It is a step of the same dialog, so the pending value is kept */
    picker = $state<ValueDialogPicker | null>(null);

    get isOpen() {
        return this.target !== null;
    }

    open(sectionId: string, componentId: string) {
        this.target = { sectionId, componentId };
    }

    close() {
        this.picker = null;
        this.target = null;
    }

    openPicker(picker: ValueDialogPicker) {
        this.picker = picker;
    }

    /** Goes back from the picker step to the normal content. A no-op when there is no step */
    closePicker() {
        const picker = this.picker;
        if (!picker) return;
        this.picker = null;
        picker.onclose();
    }

    /** The button of an empty state that opens the dialog for a component. Only in edit mode, as that is where a value can be set */
    getAction(mode: ScribeMode, sectionId: string, componentId: string, label: string): EmptyContentAction | undefined {
        if (mode !== 'edit') return undefined;
        return { label, onclick: () => this.open(sectionId, componentId) };
    }
}

export const valueDialogStore = new ValueDialogStore();
