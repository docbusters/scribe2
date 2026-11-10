import type { TextFormatCommand, TextFormats } from '../utils/textFormat.js';

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
 * With a marked fragment the options format it (the text does it, the store only calls it back). With only a caret they
 * set the format of what is typed next (the pending format)
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

    // Not reactive: they are only compared when the caret moves or a format is toggled
    private caretKey: CaretKey | null = null;
    private caretFormats: TextFormats = { ...NO_FORMATS };
    private pendingCaretKey: CaretKey | null = null;
    /** Formats the marked fragment. It belongs to the text that holds it, which is the one that can rewrite its content */
    private applyToSelection: ((command: TextFormatCommand) => void) | null = null;

    /** Whether the options can act, which is whenever a text holds the caret */
    get canFormat(): boolean {
        return this.componentId !== null;
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
        this.applyToSelection = null;

        this.caretKey = caretKey;
        this.caretFormats = { ...formats };

        if (this.pending && areSameCaret(this.pendingCaretKey, caretKey)) return;
        this.dropPending();
        this.setActiveFormats(formats);
    }

    /** A fragment of a text is marked. The text passes the formats of the fragment and how to format it */
    setSelection(
        sectionId: string,
        componentId: string,
        selectionRange: { start: number, end: number, text: string },
        formats: TextFormats,
        apply: (command: TextFormatCommand) => void
    ) {
        this.setOwner(sectionId, componentId);
        this.caretKey = null;
        this.dropPending();
        this.applyToSelection = apply;

        const current = this.selectionRange;
        if (!current || current.start !== selectionRange.start || current.end !== selectionRange.end || current.text !== selectionRange.text) {
            this.selectionRange = selectionRange;
        }

        this.setActiveFormats(formats);
    }

    clear() {
        this.sectionId = null;
        this.componentId = null;
        this.selectionRange = null;
        this.applyToSelection = null;
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
            this.applyToSelection?.(command);
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
}

export const textFormatStore = new TextFormatStore();
