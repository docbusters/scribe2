export class ToolbarStore {
    isOpen = $state(false);
    position = $state({ x: 0, y: 0 });
    sectionId = $state<string | null>(null);
    componentId = $state<string | null>(null);
    shouldReplaceComponent = $state(false);

    open(x: number, y: number, sectionId: string, componentId: string | null = null, shouldReplaceComponent: boolean = false) {
        this.position = { x, y };
        this.sectionId = sectionId;
        this.componentId = componentId;
        this.shouldReplaceComponent = shouldReplaceComponent;
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
        this.sectionId = null;
        this.componentId = null;
        this.shouldReplaceComponent = false;
    }
}

export const toolbarStore = new ToolbarStore();
