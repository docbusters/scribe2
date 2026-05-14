import type { Document } from "$lib/domain/Document.js";
import { generateRandomId } from "$lib/utils/generateRandomId.js";

/** Handles document modifications when the document is in edit mode */
class EditStore<C> {
    document = $state<Document<C>>(null!);

    initialize(document: Document<C>) {
        this.document = document;
    }

    /** Adds a new section below the specified section */
    addSectionBelow(sectionId: string) {
        const index = this.document.sections.findIndex(section => section.id === sectionId);
        if (index === -1) {
            console.warn("Section not found for adding new section:", sectionId);
            return false;
        }
        const newSection = {
            id: generateRandomId("section"),
            type: "paragraph-section",
            title: "New Section",
            content: []
        } as Document<C>["sections"][number];
        const sections = [...this.document.sections];
        sections.splice(index + 1, 0, newSection);
        this.document = { ...this.document, sections };
        return true;
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

    /** Duplicates a section and adds it after the original */
    duplicateSection(sectionId: string) {
        const index = this.document.sections.findIndex(section => section.id === sectionId);
        if (index === -1) {
            console.warn("Section not found for duplication:", sectionId);
            return false;
        }
        const sectionToDuplicate = this.document.sections[index];
        const duplicatedSection = { ...sectionToDuplicate, id: generateRandomId("section") };
        const sections = [...this.document.sections];
        sections.splice(index + 1, 0, duplicatedSection);
        this.document = { ...this.document, sections };
        return true;
    }

    /** Deletes a section from the document */
    deleteSection(sectionId: string) {
        const index = this.document.sections.findIndex(section => section.id === sectionId);
        if (index === -1) {
            console.warn("Section not found for deletion:", sectionId);
            return false;
        }
        const sections = [...this.document.sections];
        sections.splice(index, 1);
        this.document = { ...this.document, sections };
        return true;
    }
}

export const editStore = new EditStore();
