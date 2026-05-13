import type { Document } from "$lib/domain/Document.js";

/** Handles document modifications when the document is in edit mode */
class EditStore<C> {
    document = $state<Document<C>>(null!);

    initialize(document: Document<C>) {
        this.document = document;
    }

    /** Moves a section within the document from oldIndex to newIndex */
    moveSection(oldIndex: number, newIndex: number) {
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= this.document.sections.length || newIndex >= this.document.sections.length) {
            console.warn("Invalid section indices for moving:", { oldIndex, newIndex });
            return;
        }
        const sections = [...this.document.sections];
        const [movedSection] = sections.splice(oldIndex, 1);
        sections.splice(newIndex, 0, movedSection);
        this.document = { ...this.document, sections };
    }
}

export const editStore = new EditStore();
