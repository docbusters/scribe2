import type { ComponentConfig } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";
import { editStore } from "$lib/stores/edit-store.svelte.js";
import { toolbarStore, type ToolbarInsertion } from "$lib/stores/toolbar-store.svelte.js";
import { valueDialogStore } from "$lib/stores/value-dialog-store.svelte.js";

export interface ComponentEditOnClick {
    event: MouseEvent;
    sectionId: string;
    componentId: string;
    /** Set only when the caret is in a text, so a component can be inserted exactly at the caret */
    insertion?: ToolbarInsertion;
}

export interface ComponentEditProps {
    componentType: string;
    componentValue: DataValue;
    isBinding: boolean;
    sectionId: string;
    componentId: string;
    disabled: boolean;
    name: string;
    onclick?: (data: ComponentEditOnClick) => void;
    icon?: string;
    /** Short text for the option. When present the option is meant to be drawn as a large button (icon over text) */
    label?: string;
    isSelected: boolean;
}

/** What an option knows about the component it acts on, to decide whether it is selected or disabled */
export interface ComponentEditOptionContext {
    sectionId: string;
    componentId: string;
    value: DataValue;
    config: ComponentConfig | undefined;
}

export interface ComponentEditOptions {
    type: string;
    name: string;
    /** Short text for the option: when present it is drawn as a large button (icon over text), otherwise as a small icon button */
    label?: string;
    /** Title of the group the option belongs to. Options sharing a group are drawn together, even when they are not consecutive */
    group?: string;
    /**
     * Function to determine if the option is selected. If not provided, the option will not be considered selected.
     * It is evaluated reactively, so it can read stores and the buttons follow them without being mounted again
     */
    isSelected?: (data: ComponentEditOptionContext) => boolean;
    /** Function to determine if the option is disabled, on top of the disabled options of the component. Evaluated reactively like isSelected */
    isDisabled?: (data: ComponentEditOptionContext) => boolean;
    /** Framework-agnostic render function to render custom HTML/elements. Can return a cleanup function */
    render?: (container: HTMLElement, data: ComponentEditProps) => (() => void) | void;
    /** Props passed to the default button or custom render function */
    props: {
        icon: string;
        /** Not needed when the option renders itself and handles its own clicks */
        onclick?: (data: ComponentEditOnClick) => void;
    };
}

/** Space in pixels between a group of the toolbar and the dropdown opened below it */
const GROUP_DROPDOWN_GAP = 4;

export const addComponentOption: ComponentEditOptions = {
    type: 'add',
    name: 'Add component',
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        onclick: (data: ComponentEditOnClick) => {
            const { event, sectionId, componentId, insertion } = data;
            const button = event.currentTarget as HTMLElement;
            const rect = button.getBoundingClientRect();

            // The dropdown opens below the whole group (its title included), not just below the button.
            // The group is the .component-editor-group element rendered by ComponentEditor
            const group = button.closest('.component-editor-group') ?? button;
            const bottom = group.getBoundingClientRect().bottom + GROUP_DROPDOWN_GAP;

            // With the caret in a text the component is inserted exactly there
            if (insertion) {
                toolbarStore.openForInsertion(rect.left, bottom, sectionId, insertion);
                return;
            }

            // An empty componentId means appending at the end of the section
            toolbarStore.open(rect.left, bottom, sectionId, componentId || null, false);
        }
    },
};

export const duplicateComponentOption: ComponentEditOptions = {
    type: 'duplicate',
    name: 'Duplicate component',
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        onclick: (data: ComponentEditOnClick) => {
            const { sectionId, componentId } = data;
            editStore.duplicateComponent(sectionId, componentId);
        }
    },
};

export const deleteComponentOption: ComponentEditOptions = {
    type: 'delete',
    name: 'Delete component',
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-error-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        onclick: (data: ComponentEditOnClick) => {
            const { sectionId, componentId } = data;
            editStore.deleteComponent(sectionId, componentId);
        }
    },
};

export const setValueOption: ComponentEditOptions = {
    type: 'setValue',
    name: 'Set value',
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database-icon lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
        onclick: (data: ComponentEditOnClick) => {
            valueDialogStore.open(data.sectionId, data.componentId);
        }
    }
};

export const defaultComponentOptions: ComponentEditOptions[] = [addComponentOption, duplicateComponentOption, setValueOption, deleteComponentOption];
