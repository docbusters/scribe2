import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";
import type { Document } from "$lib/domain/Document.js";
import type { ParagraphSection } from "$lib/domain/Section.js";
import { generateRandomId } from "$lib/utils/generateRandomId.js";

/** Handles document modifications when the document is in edit mode */
class EditStore<C> {
    document = $state<Document<C>>(null!);

    initialize(document: Document<C>) {
        this.document = document;
    }

    /* * DOCUMENT MANAGEMENT * */
    setDocumentTitle(newTitle: string) {
        if (!this.document) {
            console.warn("No document found for setting title");
            return false;
        }
        this.document.title = newTitle;
        return true;
    }

    /* * SECTION MANAGEMENT * */

    /** Adds a new section below the specified section */
    addSectionBelow(sectionId: string) {
        if (!this.document.sections[sectionId]) {
            console.warn("Section not found for adding new section:", sectionId);
            return false;
        }
        
        const newSectionId = generateRandomId("section");
        const newSection = {
            id: newSectionId,
            type: "paragraph-section",
            title: "New Section",
            content: {}
        } as Document<C>["sections"][string];
        
        const newSections: typeof this.document.sections = {};
        for (const [key, section] of Object.entries(this.document.sections)) {
            newSections[key] = section;
            if (key === sectionId) {
                newSections[newSectionId] = newSection;
            }
        }
        this.document.sections = newSections;
        return true;
    }

    /** Moves a section within the document from oldIndex to newIndex */
    moveSection(oldIndex: number, newIndex: number) {
        const entries = Object.entries(this.document.sections);
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= entries.length || newIndex >= entries.length) {
            console.warn("Invalid section indices for moving:", { oldIndex, newIndex });
            return;
        }
        const [movedEntry] = entries.splice(oldIndex, 1);
        entries.splice(newIndex, 0, movedEntry);
        this.document.sections = Object.fromEntries(entries);
    }

    /** Duplicates a section and adds it after the original */
    duplicateSection(sectionId: string) {
        if (!this.document.sections[sectionId]) {
            console.warn("Section not found for duplication:", sectionId);
            return false;
        }
        const sectionToDuplicate = this.document.sections[sectionId];
        const newSectionId = generateRandomId("section");
        const duplicatedSection = { ...sectionToDuplicate, id: newSectionId };
        
        const newSections: typeof this.document.sections = {};
        for (const [key, section] of Object.entries(this.document.sections)) {
            newSections[key] = section;
            if (key === sectionId) {
                newSections[newSectionId] = duplicatedSection;
            }
        }
        this.document.sections = newSections;
        return true;
    }

    /** Deletes a section from the document */
    deleteSection(sectionId: string) {
        if (!this.document.sections[sectionId]) {
            console.warn("Section not found for deletion:", sectionId);
            return false;
        }
        const newSections = { ...this.document.sections };
        delete newSections[sectionId];
        this.document.sections = newSections;
        return true;
    }

    editSectionTitle(sectionId: string, newTitle: string) {
        if (!this.document.sections[sectionId]) {
            console.warn("Section not found for editing title:", sectionId);
            return false;
        }
        this.document.sections[sectionId] = {
            ...this.document.sections[sectionId],
            title: newTitle
        };
        return true;
    }

    /* * COMPONENT MANAGEMENT * */

    getComponentValue(sectionId: string, componentId: string) {
        const section = this.document.sections[sectionId] as ParagraphSection<C>;
        if (!section) {
            console.warn("Section not found for setting component value:", sectionId);
            return null;
        }
        const component = section.content[componentId] as unknown as BaseComponent<string, DataValue, ComponentConfig>;
        if (!component) {
            console.warn("Component not found for setting value:", componentId);
            return null;
        }
        return component.value;
    }

    setComponentValue(sectionId: string, componentId: string, newValue: DataValue) {
        const section = this.document.sections[sectionId] as ParagraphSection<C>;
        if (!section) {
            console.warn("Section not found for setting component value:", sectionId);
            return false;
        }
        const component = section.content[componentId] as unknown as BaseComponent<string, DataValue, ComponentConfig>;
        if (!component) {
            console.warn("Component not found for setting value:", componentId);
            return false;
        }
        component.value = newValue;

        // Force a reactivity update depending on Svelte 5 state behavior
        this.document.sections[sectionId] = section;
        
        return true;
    }
}

export const editStore = new EditStore();
