import type { StringValue } from "../domain/data/DataValue.js";
import { editStore } from "./edit-store.svelte.js";
import { BOLD_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../constants/DocumentConstants.js';
import { removeEmptyToggles } from '../utils/textFormatEscape.js';

export type TextFormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough';

export interface TextFormats {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
}

/** Where the caret is. Compared member by member, to know whether the caret has moved */
export interface CaretKey {
    node: Node | null;
    offset: number;
}

const NO_FORMATS: TextFormats = { bold: false, italic: false, strikethrough: false, underline: false };

function areSameFormats(a: TextFormats, b: TextFormats): boolean {
    return a.bold === b.bold && a.italic === b.italic && a.strikethrough === b.strikethrough && a.underline === b.underline;
}

function areSameCaret(a: CaretKey | null, b: CaretKey | null): boolean {
    return a?.node === b?.node && a?.offset === b?.offset;
}

/**
 * Follows the text that holds the caret, so the format options of the toolbars know what they act on and what to show.
 * With a marked fragment the options format it. With only a caret they set the format of what is typed next (the pending format)
 */
export class TextFormatStore {
    /** The text that holds the caret or the marked fragment */
    sectionId = $state<string | null>(null);
    componentId = $state<string | null>(null);
    /** The marked fragment, or null when there is only a caret */
    selectionRange = $state<{ start: number, end: number, text: string } | null>(null);
    /** What the options show: the formats of the marked fragment, or the ones at the caret (the pending ones after a toggle) */
    activeFormats = $state<TextFormats>({ ...NO_FORMATS });
    /** The formats of the characters typed next, once a format is toggled at the caret. Null while they follow the caret */
    pending = $state<TextFormats | null>(null);
    /** A fragment is marked in a text that is not in the document yet (a ghost), so it cannot be formatted */
    rangeBlocked = $state(false);

    // Not reactive: they are only compared when the caret moves or a format is toggled
    private caretKey: CaretKey | null = null;
    private caretFormats: TextFormats = { ...NO_FORMATS };
    private pendingCaretKey: CaretKey | null = null;

    /** Whether the options can act: a text holds the caret, and a marked fragment is in a text that can be formatted */
    get canFormat(): boolean {
        return this.componentId !== null && !this.rangeBlocked;
    }

    private setOwner(sectionId: string, componentId: string) {
        if (this.sectionId !== sectionId) this.sectionId = sectionId;
        if (this.componentId !== componentId) this.componentId = componentId;
    }

    private setActiveFormats(formats: TextFormats) {
        if (!areSameFormats(this.activeFormats, formats)) {
            this.activeFormats = { ...formats };
        }
    }

    private dropPending() {
        this.pending = null;
        this.pendingCaretKey = null;
    }

    /**
     * The selection of a text is only a caret. The formats are the ones the next typed character would inherit there.
     * A pending format is dropped as soon as the caret is somewhere else
     */
    setCaret(sectionId: string, componentId: string, formats: TextFormats, caretKey: CaretKey) {
        this.setOwner(sectionId, componentId);
        if (this.selectionRange !== null) this.selectionRange = null;
        if (this.rangeBlocked) this.rangeBlocked = false;

        this.caretKey = caretKey;
        this.caretFormats = { ...formats };

        if (this.pending && areSameCaret(this.pendingCaretKey, caretKey)) return;
        this.dropPending();
        this.setActiveFormats(formats);
    }

    /** A fragment is marked in a text that cannot be formatted, as it is not in the document yet */
    setBlockedRange(sectionId: string, componentId: string) {
        this.setOwner(sectionId, componentId);
        if (this.selectionRange !== null) this.selectionRange = null;
        this.caretKey = null;
        this.dropPending();
        this.rangeBlocked = true;
        this.setActiveFormats(NO_FORMATS);
    }

    setSelection(sectionId: string, componentId: string, selectionRange: { start: number, end: number, text: string }) {
        this.setOwner(sectionId, componentId);
        this.caretKey = null;
        this.dropPending();
        if (this.rangeBlocked) this.rangeBlocked = false;

        const current = this.selectionRange;
        if (!current || current.start !== selectionRange.start || current.end !== selectionRange.end || current.text !== selectionRange.text) {
            this.selectionRange = selectionRange;
        }

        // Compute active formats based on the selection
        const origValueObj = editStore.getComponentValue(sectionId, componentId);
        if (origValueObj && typeof origValueObj.type === 'string') {
             this.computeActiveFormats((origValueObj as StringValue).value, selectionRange.start, selectionRange.end);
        }
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

        this.setActiveFormats({
            bold: finalBold,
            italic: finalItalic,
            strikethrough: finalStrikethrough,
            underline: finalUnderline
        });
    }

    clear() {
        this.sectionId = null;
        this.componentId = null;
        this.selectionRange = null;
        this.rangeBlocked = false;
        this.caretKey = null;
        this.dropPending();
    }

    /**
     * Toggles a format. With a marked fragment it is applied to it. With only a caret it becomes the pending format,
     * so the characters typed next at this same caret get it
     */
    toggle(command: TextFormatCommand) {
        if (!this.canFormat) return;

        if (this.selectionRange) {
            this.applyFormat(command);
            return;
        }

        const next: TextFormats = { ...this.activeFormats, [command]: !this.activeFormats[command] };
        this.activeFormats = next;

        // Toggling back to what the caret already has leaves nothing pending
        if (areSameFormats(next, this.caretFormats)) {
            this.dropPending();
        } else {
            this.pending = { ...next };
            this.pendingCaretKey = this.caretKey;
        }
    }

    /** The pending format has been applied to what was typed, so from now on the formats follow the caret */
    consumePending() {
        this.dropPending();
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
        newText = removeEmptyToggles(newText, char);

        editStore.setComponentValue(this.sectionId, this.componentId, { type: 'string', value: newText });

        // Update active formats to reflect the new state
        this.computeActiveFormats(newText, this.selectionRange.start, this.selectionRange.end);
    }
}

export const textFormatStore = new TextFormatStore();
