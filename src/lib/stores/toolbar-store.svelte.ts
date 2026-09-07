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

