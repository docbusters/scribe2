export type ToolbarInsertionMode = 'after' | 'before' | 'replace' | 'split';

export interface ToolbarSplitData {
    textBefore: string;
    textAfter: string;
}

export interface ToolbarOpenOptions {
    insertionMode?: ToolbarInsertionMode;
    splitData?: ToolbarSplitData;
    restoreFocus?: () => void;
}

/** Where and how a new component is inserted, given the caret of a text */
export interface ToolbarInsertion extends ToolbarOpenOptions {
    /** Component the new one is placed relative to. Null means appending at the end of the section */
    targetId: string | null;
    /** The text is empty, so the new component takes its place */
    isEmpty: boolean;
    insertionMode: ToolbarInsertionMode;
}

export class ToolbarStore {
    isOpen = $state(false);
    position = $state({ x: 0, y: 0 });
    sectionId = $state<string | null>(null);
    componentId = $state<string | null>(null);
    shouldReplaceComponent = $state(false);
    insertionMode = $state<ToolbarInsertionMode>('after');
    splitData = $state<ToolbarSplitData | null>(null);
    restoreFocus: (() => void) | null = null;

    open(
        x: number, 
        y: number, 
        sectionId: string, 
        componentId: string | null = null, 
        shouldReplaceComponent: boolean = false,
        options?: ToolbarOpenOptions
    ) {
        this.position = { x, y };
        this.sectionId = sectionId;
        this.componentId = componentId;
        this.shouldReplaceComponent = shouldReplaceComponent;
        
        if (options?.insertionMode) {
            this.insertionMode = options.insertionMode;
        } else if (shouldReplaceComponent) {
            this.insertionMode = 'replace';
        } else {
            this.insertionMode = 'after';
        }

        this.splitData = options?.splitData || null;
        this.restoreFocus = options?.restoreFocus || null;
        this.isOpen = true;
    }

    /** Opens the toolbar to insert a component at the place described by the insertion */
    openForInsertion(x: number, y: number, sectionId: string, insertion: ToolbarInsertion) {
        this.open(x, y, sectionId, insertion.targetId, insertion.isEmpty, {
            insertionMode: insertion.insertionMode,
            splitData: insertion.splitData,
            restoreFocus: insertion.restoreFocus
        });
    }

    close() {
        this.isOpen = false;
        this.sectionId = null;
        this.componentId = null;
        this.shouldReplaceComponent = false;
        this.insertionMode = 'after';
        this.splitData = null;
        this.restoreFocus = null;
    }
}

export const toolbarStore = new ToolbarStore();

