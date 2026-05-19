import type { TextComponentConfig } from "$lib/domain/components/DefaultComponentsConfig.js";
import type { StringValue } from "$lib/domain/data/DataValue.js";
import { editStore } from "./edit-store.svelte.js";

export type TextFormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough';

export class TextFormatToolbarStore {
    isOpen = $state(false);
    position = $state({ x: 0, y: 0 });
    sectionId = $state<string | null>(null);
    componentId = $state<string | null>(null);
    currentConfig = $state<TextComponentConfig | null>(null);
    selectionRange = $state<{ start: number, end: number, text: string } | null>(null);

    open(x: number, y: number, sectionId: string, componentId: string, selectionRange: { start: number, end: number, text: string }, config: TextComponentConfig | null) {
        this.position = { x, y };
        this.sectionId = sectionId;
        this.componentId = componentId;
        this.selectionRange = selectionRange;
        this.currentConfig = config;
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
        this.sectionId = null;
        this.componentId = null;
        this.selectionRange = null;
        this.currentConfig = null;
    }

    applyFormat(command: TextFormatCommand) {
        if (!this.selectionRange || !this.sectionId || !this.componentId) {
            console.warn("No selection or component to apply format to");
            return;
        }

        const origValueObj = editStore.getComponentValue(this.sectionId, this.componentId);
        if (!origValueObj || typeof origValueObj.type !== 'string') return;

        const origText = (origValueObj as StringValue).value;
        const { start, end } = this.selectionRange;

        // Toggle the requested style
        const newConfig: TextComponentConfig = { 
            ...(this.currentConfig || {}), 
            [command]: !(this.currentConfig?.[command]) 
        };

        const beforeText = origText.substring(0, start);
        const selectedText = origText.substring(start, end);
        const afterText = origText.substring(end);

        // If selection matches the entire text, simply update the component config
        if (start === 0 && end === origText.length) {
            editStore.setComponentConfig(this.sectionId, this.componentId, newConfig);
            this.close();
            return;
        }

        // If it is a partial selection, we need to split the text into parts and apply the new config to the selected part
        const parts = [];
        if (beforeText.length > 0) parts.push({ text: beforeText, config: this.currentConfig });
        if (selectedText.length > 0) parts.push({ text: selectedText, config: newConfig });
        if (afterText.length > 0) parts.push({ text: afterText, config: this.currentConfig });

        if (parts.length > 0) {
            let currentId = this.componentId;
            let isFirst = true;

            for (const part of parts) {
                if (isFirst) {
                    // The first part replaces the original component value and config
                    editStore.setComponentValue(this.sectionId, currentId, { type: 'string', value: part.text });
                    editStore.setComponentConfig(this.sectionId, currentId, part.config || {});
                    isFirst = false;
                } else {
                    // The following fragments are added sequentially right after the original component
                    const newId = editStore.addComponent(this.sectionId, currentId, 'text', false);
                    if (typeof newId === 'string') {
                        editStore.setComponentValue(this.sectionId, newId, { type: 'string', value: part.text });
                        editStore.setComponentConfig(this.sectionId, newId, part.config || {});
                        currentId = newId;
                    }
                }
            }
        }

        this.close();
    }
}

export const textFormatToolbarStore = new TextFormatToolbarStore();
