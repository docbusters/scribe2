import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";
import type { BindingsDefinition, Document } from "$lib/domain/Document.js";
import type { ParagraphSection } from "$lib/domain/Section.js";
import { generateDefaultDataValue } from "$lib/utils/generateDefaultDataValue.js";
import { generateRandomId } from "$lib/utils/generateRandomId.js";
import { dataStore } from "./data-store.svelte.ts";
import { globalRegistry } from "./global-registry.svelte.ts";

/** Handles document and binding modifications when the document is in edit mode */
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

    private findSection(sectionId: string) {
        const section = this.document.sections[sectionId];
        if (!section) {
            console.warn("Section not found:", sectionId);
            return null;
        }
        return section;
    }

    /** Adds a new section below the specified section */
    addSectionBelow(sectionId: string) {
        const section = this.findSection(sectionId);
        if (!section) return false;
        
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
        const sectionToDuplicate = this.findSection(sectionId);
        if (!sectionToDuplicate) return false;
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
        const section = this.findSection(sectionId);
        if (!section) return false;
        const newSections = { ...this.document.sections };
        delete newSections[sectionId];
        this.document.sections = newSections;
        return true;
    }

    editSectionTitle(sectionId: string, newTitle: string) {
        const section = this.findSection(sectionId);
        if (!section) return false;
        this.document.sections[sectionId] = {
            ...this.document.sections[sectionId],
            title: newTitle
        };
        return true;
    }

    /* * COMPONENT MANAGEMENT * */

    /** Searches recursively for a component within a nested value structure */
    private searchComponentInValue(value: DataValue, targetId: string): BaseComponent<string, DataValue, ComponentConfig> | null {
        if (!value) return null;

        if (value.type === "component") {
            const nestedComponent = value.value as BaseComponent<string, DataValue, ComponentConfig>;
            if (nestedComponent.id === targetId) {
                return nestedComponent;
            }
            return this.searchComponentInValue(nestedComponent.value, targetId);
        } else if (value.type === "array") {
            for (const item of value.value) {
                const found = this.searchComponentInValue(item as DataValue, targetId);
                if (found) return found;
            }
        } else if (value.type === "record") {
            for (const item of Object.values(value.value)) {
                const found = this.searchComponentInValue(item as DataValue, targetId);
                if (found) return found;
            }
        }
        return null;
    }

    /** Finds a component within a section. This method will also find nested components */
    private findComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return null;

        // First attempt to find the component at the top level of the section content
        const component = section.content[componentId] as unknown as BaseComponent<string, DataValue, ComponentConfig>;
        // If found return it immediately
        if (component) return component;

        // If not found, we try to find nested components within component values
        for (const topLevelComponent of Object.values(section.content)) {
            const castedComp = topLevelComponent as unknown as BaseComponent<string, DataValue, ComponentConfig>;
            const found = this.searchComponentInValue(castedComp.value, componentId);
            if (found) return found;
        }

        return null;
    }

    getComponentValue(sectionId: string, componentId: string) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return null;
        return component.value;
    }

    setComponentValue(sectionId: string, componentId: string, newValue: DataValue) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return false;
        component.value = newValue;
        
        return true;
    }


    /** Add a new component to a section. If componentId is null, the component will be appended to the end */
    addComponent(sectionId: string, componentId: string | null, componentType: string, replaceComponent: boolean = false) {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return null;

        // Generate a new id and build the component
        const newId = generateRandomId(componentType);
        const emptyComponent = globalRegistry.getEmptyComponent(componentType);

        // Generate a default value based on the value type
        const value = generateDefaultDataValue(emptyComponent.value);

        const newComponent = {
            ...emptyComponent,
            id: newId,
            value,
        } as C;

        console.log(newComponent);
        console.log(this.document.bindings);

        // If no target component is specified, just append to the end
        if (!componentId) {
            section.content[newId] = newComponent;
            return newId;
        }

        // Reconstruct the section content object to preserve order and insert after or replace the target
        const entries = Object.entries(section.content);
        const targetIndex = entries.findIndex(([key]) => key === componentId);

        if (targetIndex !== -1) {
            // Target is a top-level component in the section
            if (replaceComponent) {
                entries.splice(targetIndex, 1, [newId, newComponent]);
            } else {
                entries.splice(targetIndex + 1, 0, [newId, newComponent]);
            }
            section.content = Object.fromEntries(entries);
            return newId;
        } else {
            console.warn("Insertion next to nested components is not fully supported yet or component not found. Appending to the end.");
            section.content[newId] = newComponent;
            return newId;
        }
    }

    /* * BINDINGS MANAGEMENT * */
    addBinding(definition: BindingsDefinition) {
        // Add the new binding to the document
        const newId = generateRandomId("binding");
        this.document.bindings[newId] = definition;

        // Also initialize the binding value in the data store
        dataStore.addBinding(newId, definition);

        return newId;
    }
}

export const editStore = new EditStore();
