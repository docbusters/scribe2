export class ToolbarStore {
    isOpen = $state(false);
    position = $state({ x: 0, y: 0 });

    open(x: number, y: number) {
        this.position = { x, y };
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }
}

export const toolbarStore = new ToolbarStore();
