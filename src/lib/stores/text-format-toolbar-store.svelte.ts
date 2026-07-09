import type { StringValue } from "../domain/data/DataValue.js";
import { editStore } from "./edit-store.svelte.js";
import { BOLD_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../constants/DocumentConstants.js';

export type TextFormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough';

export class TextFormatToolbarStore {
    isOpen = $state(false);
    position = $state({ x: 0, y: 0 });
    sectionId = $state<string | null>(null);
    componentId = $state<string | null>(null);
    selectionRange = $state<{ start: number, end: number, text: string } | null>(null);
    activeFormats = $state<{ bold: boolean, italic: boolean, strikethrough: boolean, underline: boolean }>({
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false
    });

    open(x: number, y: number, sectionId: string, componentId: string, selectionRange: { start: number, end: number, text: string }) {
        this.position = { x, y };
        this.sectionId = sectionId;
        this.componentId = componentId;
        this.selectionRange = selectionRange;
        
        // Compute active formats based on the selection
        const origValueObj = editStore.getComponentValue(sectionId, componentId);
        if (origValueObj && typeof origValueObj.type === 'string') {
             this.computeActiveFormats((origValueObj as StringValue).value, selectionRange.start, selectionRange.end);
        }

        this.isOpen = true;
    }

    private computeActiveFormats(markdown: string, visualStart: number, visualEnd: number) {
        let vIdx = 0;
        let bold = false, italic = false, strikethrough = false, underline = false;
        
        // Track the minimum formats across the selection
        let hasSelectedChars = false;
        let finalBold = true, finalItalic = true, finalStrikethrough = true, finalUnderline = true;

        for (let i = 0; i < markdown.length; i++) {
            const char = markdown[i];
            
            if (char === '\\') {
                if (vIdx >= visualStart && vIdx < visualEnd) {
                    hasSelectedChars = true;
                    finalBold = finalBold && bold;
                    finalItalic = finalItalic && italic;
                    finalStrikethrough = finalStrikethrough && strikethrough;
                    finalUnderline = finalUnderline && underline;
                }
                i++; // skip escaped char
                vIdx++;
                continue;
            }

            if (char === BOLD_CHAR) bold = !bold;
            else if (char === ITALIC_CHAR) italic = !italic;
            else if (char === STRIKETHROUGH_CHAR) strikethrough = !strikethrough;
            else if (char === UNDERLINE_CHAR) underline = !underline;
            else {
                // It's a visible character
                if (vIdx >= visualStart && vIdx < visualEnd) {
                    hasSelectedChars = true;
                    finalBold = finalBold && bold;
                    finalItalic = finalItalic && italic;
                    finalStrikethrough = finalStrikethrough && strikethrough;
                    finalUnderline = finalUnderline && underline;
                }
                vIdx++;
            }
        }

        if (!hasSelectedChars) {
            finalBold = bold; finalItalic = italic; finalStrikethrough = strikethrough; finalUnderline = underline;
        }

        this.activeFormats = {
            bold: finalBold,
            italic: finalItalic,
            strikethrough: finalStrikethrough,
            underline: finalUnderline
        };
    }

    close() {
        this.isOpen = false;
        this.sectionId = null;
        this.componentId = null;
        this.selectionRange = null;
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

        // NOTE: It is important to consider that visual selection differs from the actual string indexes
        // We adjust the selection indexes to account for formatting characters and escaped characters in the markdown string
        let mStart = -1;
        let mEnd = -1;
        let vIdx = 0;

        for (let i = 0; i <= origText.length; i++) {
            const currentChar = i < origText.length ? origText[i] : null;
            const isFormat = currentChar === BOLD_CHAR || currentChar === ITALIC_CHAR || currentChar === STRIKETHROUGH_CHAR || currentChar === UNDERLINE_CHAR;
            const isEscape = currentChar === '\\';

            if (vIdx === start && mStart === -1 && !isFormat) {
                mStart = i;
            }
            if (vIdx === end && mEnd === -1) {
                mEnd = i;
            }

            if (i === origText.length) break;

            if (isEscape) {
                i++; // Skip the escaped character
                vIdx++;
            } else if (!isFormat) {
                vIdx++;
            }
        }

        if (mStart === -1) mStart = origText.length;
        if (mEnd === -1) mEnd = origText.length;

        // Depending on the command, we determine which formatting character to use
        let char = '';
        if (command === 'bold') char = BOLD_CHAR;
        else if (command === 'italic') char = ITALIC_CHAR;
        else if (command === 'strikethrough') char = STRIKETHROUGH_CHAR;
        else if (command === 'underline') char = UNDERLINE_CHAR;

        // Check the active format to toggle it correctly
        const targetState = !this.activeFormats[command];
        
        // Check if the format is currently active
        let isFormatActive = false;
        let beforeText = "";
        for (let i = 0; i < mStart; i++) {
            const c = origText[i];
            if (c === '\\') {
                beforeText += c;
                if (i + 1 < mStart) {
                    beforeText += origText[i + 1];
                    i++;
                }
            } else if (c === char) {
                isFormatActive = !isFormatActive;
                beforeText += c;
            } else {
                beforeText += c;
            }
        }

        // Clean the selected text from the formatting character to get the actual text that will be wrapped with the formatting character if toggled on.
        let isFormatActiveAfter = isFormatActive;
        let cleanSelected = "";
        for (let i = mStart; i < mEnd; i++) {
            const c = origText[i];
            if (c === '\\') {
                cleanSelected += c;
                if (i + 1 < mEnd) {
                    cleanSelected += origText[i + 1];
                    i++;
                }
            } else if (c === char) {
                isFormatActiveAfter = !isFormatActiveAfter;
                // Omit the formatting character
            } else {
                cleanSelected += c;
            }
        }

        // Build the final text
        const afterText = origText.substring(mEnd);

        let newText = beforeText;
        if (targetState !== isFormatActive) {
            newText += char;
        }
        newText += cleanSelected;
        if (targetState !== isFormatActiveAfter) {
            newText += char;
        }
        newText += afterText;

        // Clean up empty toggles
        const emptyToggle = char + char;
        while (newText.includes(emptyToggle)) {
            newText = newText.replace(emptyToggle, '');
        }

        editStore.setComponentValue(this.sectionId, this.componentId, { type: 'string', value: newText });

        // Update active formats to reflect the new state
        this.computeActiveFormats(newText, this.selectionRange.start, this.selectionRange.end);
    }
}

export const textFormatToolbarStore = new TextFormatToolbarStore();
