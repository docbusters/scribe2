import type { ToolbarInsertion } from './toolbar-store.svelte.js';

/** A component of the document is selected */
export interface SelectedComponent {
    kind: 'component';
    sectionId: string;
    componentId: string;
    /** Edit options that must be disabled for this component, so every toolbar offers the same options as the component's own editor */
    disabledOptions: string[];
}

/** The caret is in an empty text slot or in a text that has not been created yet, so a new component can be inserted there but there is no component to act on */
export interface SelectedInsertionPoint {
    kind: 'insertion';
    sectionId: string;
    /** Id of the text that holds the caret */
    textId: string;
}

export type EditorSelection = SelectedComponent | SelectedInsertionPoint;

/** The text that holds the caret, and how to describe the place of the caret as an insertion */
interface CaretSource {
    textId: string;
    capture: () => ToolbarInsertion | null;
}

/** Tracks what is currently selected in edit mode. The selection decides the options shown by toolbars */
export class SelectionStore {
    selected = $state<EditorSelection | null>(null);

    // Not reactive: it is only read when a toolbar button is clicked
    private caretSource: CaretSource | null = null;

    select(sectionId: string, componentId: string, disabledOptions: string[]) {
        if (this.caretSource?.textId !== componentId) {
            this.caretSource = null;
        }
        if (this.isSelected(sectionId, componentId)) return;
        this.selected = { kind: 'component', sectionId, componentId, disabledOptions };
    }

    selectInsertionPoint(sectionId: string, textId: string) {
        const current = this.selected;
        if (current?.kind === 'insertion' && current.sectionId === sectionId && current.textId === textId) return;
        this.selected = { kind: 'insertion', sectionId, textId };
    }

    clear() {
        this.caretSource = null;
        if (this.selected === null) return;
        this.selected = null;
    }

    isSelected(sectionId: string, componentId: string): boolean {
        return this.selected?.kind === 'component' && this.selected.sectionId === sectionId && this.selected.componentId === componentId;
    }

    /** Registers the text that holds the caret. The text calls it when it receives the focus */
    setCaretSource(textId: string, capture: () => ToolbarInsertion | null) {
        this.caretSource = { textId, capture };
    }

    /**
     * Describes the place of the caret as an insertion, so a component can be inserted exactly there.
     * Returns null when the caret does not belong to what is selected (for example when an image is selected)
     */
    captureInsertion(): ToolbarInsertion | null {
        const source = this.caretSource;
        const selected = this.selected;
        if (!source || !selected) return null;

        const selectedTextId = selected.kind === 'component' ? selected.componentId : selected.textId;
        if (selectedTextId !== source.textId) return null;

        return source.capture();
    }
}

export const selectionStore = new SelectionStore();
