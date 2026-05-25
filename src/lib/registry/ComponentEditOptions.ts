import ComponentEditorValueSelector from "$lib/components/component/ComponentEditorValueSelector.svelte";
import { editStore } from "$lib/stores/edit-store.svelte.js";
import { toolbarStore } from "$lib/stores/toolbar-store.svelte.js";
import { mount, unmount } from "svelte";

export interface ComponentEditOnClick {
    event: MouseEvent;
    sectionId: string;
    componentId: string;
}

export interface ComponentEditProps {
    componentType: string;
    sectionId: string;
    componentId: string;
    disabled: boolean;
    name: string;
    onclick?: (data: ComponentEditOnClick) => void;
    icon?: string;
}

export interface ComponentEditOptions {
    type: string;
    name: string;
    /** Framework-agnostic render function to render custom HTML/elements. Can return a cleanup function */
    render?: (container: HTMLElement, data: ComponentEditProps) => (() => void) | void;
    /** Props passed to the default button or custom render function */
    props?: {
        icon: string;
        onclick: (data: ComponentEditOnClick) => void;
    };
}

export const addComponentOption: ComponentEditOptions = {
    type: 'add',
    name: 'Add component',
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        onclick: (data: ComponentEditOnClick) => {
            const { event, sectionId, componentId } = data;
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            toolbarStore.open(rect.left, rect.bottom, sectionId, componentId, false);
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
    render: (container, props) => {
        const app = mount(ComponentEditorValueSelector, {
            target: container,
            props,
        });
        return () => {
            unmount(app);
        };
    },
    props: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database-icon lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
        onclick(data: ComponentEditOnClick) {
            console.log('Set value clicked', data);
        },
    }
};

export const defaultComponentOptions: ComponentEditOptions[] = [addComponentOption, duplicateComponentOption, setValueOption, deleteComponentOption];
