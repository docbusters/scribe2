export interface ComponentSelection {
    sectionId: string;
    componentId: string;
}

/** Tracks which component is currently selected in edit mode. The selection decides the options shown by toolbars */
export class SelectionStore {
    selected = $state<ComponentSelection | null>(null);

    select(sectionId: string, componentId: string) {
        if (this.isSelected(sectionId, componentId)) return;
        this.selected = { sectionId, componentId };
    }

    clear() {
        if (this.selected === null) return;
        this.selected = null;
    }

    isSelected(sectionId: string, componentId: string): boolean {
        return this.selected?.sectionId === sectionId && this.selected?.componentId === componentId;
    }
}

export const selectionStore = new SelectionStore();
