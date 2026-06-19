import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { CollectionValue, DataValue, PrimitiveValue, StringValue } from "../domain/data/DataValue.js";
import type { BindingsDefinition, Document } from "../domain/Document.js";
import type { ParagraphSection, Section } from "../domain/Section.js";
import { generateDefaultDataValue } from "../utils/generateDefaultDataValue.js";
import { generateRandomId } from "../utils/generateRandomId.js";
import { bindingStore } from "./binding-store.svelte.js";
import { globalRegistry } from "./global-registry.svelte.js";

/** Handles document and binding modifications when the document is in edit mode */
class EditStore<C extends BaseComponent<string, DataValue, ComponentConfig | undefined>> {
    document = $state<Document<C>>(null!);
    bindings = $state<Record<string, BindingsDefinition>>({});

    initialize(document: Document<C>, bindings: Record<string, BindingsDefinition>) {
        this.document = document;
        this.bindings = bindings;
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
    addSectionBelow(sectionId: string | null) {
        const newSectionId = generateRandomId("section");
        const newSection = {
            id: newSectionId,
            type: "paragraph-section",
            title: "New Section",
            content: {}
        } as Document<C>["sections"][string];

        const newSections: typeof this.document.sections = {};

        if (sectionId === null) {
            this.document.sections = { [newSectionId]: newSection, ...this.document.sections };
            return true;
        } else {
            const target = this.findSection(sectionId);
            if (!target) return false;

            for (const [key, sec] of Object.entries(this.document.sections)) {
                newSections[key] = sec;
                if (key === sectionId) {
                    newSections[newSectionId] = newSection;
                }
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
        const newContent: typeof sectionToDuplicate.content = {};

        // Generate a new id for each of the components in the duplicated section to ensure uniqueness
        for (const comp of Object.values(sectionToDuplicate.content)) {
            const dupComp = this.cloneComponent(comp);

            // Add the duplicated component to the new content map with its new ID
            newContent[dupComp.id] = {
                ...dupComp,
            } as C;
        }

        // Create the duplicated section with the new ID and the brand new content map
        const duplicatedSection = { 
            ...sectionToDuplicate, 
            id: newSectionId,
            content: newContent 
        } as Section<C>;

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
        const component = section.content[componentId];
        // If found return it immediately
        if (component) return component;

        // If not found, we try to find nested components within component values
        for (const topLevelComponent of Object.values(section.content)) {
            const found = this.searchComponentInValue(topLevelComponent.value, componentId);
            if (found) return found;
        }

        return null;
    }

    /** Duplicates a component and assigns it a new ID. Also handles nested components that may be present in values */
    private cloneComponent(comp: BaseComponent<string, DataValue, ComponentConfig | undefined>): BaseComponent<string, DataValue, ComponentConfig | undefined> {
        const newCompId = generateRandomId(comp.type);
        const clonedComponent = { ...comp, id: newCompId } as BaseComponent<string, DataValue, ComponentConfig | undefined>;

        // Verify the component value as it may have nested components that also need new IDs
        const value = {...clonedComponent.value};
        if (value.type === "component") {
            const nestedComp = value.value;
            const newNestedCompId = generateRandomId(nestedComp.type);
            value.value = {
                ...nestedComp,
                id: newNestedCompId
            };
        } else if (value.type === "array") {
            value.value = value.value.map(item => {
                if (item.type === "component") {
                    const nestedComp = item.value;
                    const newNestedCompId = generateRandomId(nestedComp.type);
                    return {
                        ...item,
                        value: {
                            ...nestedComp,
                            id: newNestedCompId
                        }
                    };
                }
                return item;
            });
        } else if (value.type === "record") {
            const newRecord: Record<string, DataValue> = {};
            for (const [key, item] of Object.entries(value.value)) {
                if (item.type === "component") {
                    const nestedComp = item.value;
                    const newNestedCompId = generateRandomId(nestedComp.type);
                    newRecord[key] = {
                        ...item,
                        value: {
                            ...nestedComp,
                            id: newNestedCompId
                        }
                    };
                } else {
                    newRecord[key] = item;
                }
            }
            value.value = newRecord;
        }

        return clonedComponent;
    }

    getComponentValue(sectionId: string, componentId: string) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return null;
        return component.value;
    }

    setComponentValue(sectionId: string, componentId: string, newValue: DataValue) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return false;

        // Verify if the new value is supported
        if (!globalRegistry.getComponentValueTypes(component.type).includes(newValue.type)) {
            console.warn(`Value type ${newValue.type} is not supported for component type ${component.type}`);
            return false;
        }

        // TODO: Verifiy the value with more detail

        component.value = newValue;
        console.log(`Updated component ${componentId} value:`, newValue);
        
        return true;
    }

    getComponentConfig(sectionId: string, componentId: string) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return null;
        return component.config;
    }

    setComponentConfig(sectionId: string, componentId: string, newConfig: ComponentConfig) {
        const component = this.findComponent(sectionId, componentId);
        if (!component) return false;
        component.config = newConfig;
        return true;
    }

    /** Duplicates a component within a section and adds it right after the original component */
    duplicateComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return false;
        const componentToDuplicate = this.findComponent(sectionId, componentId);
        if (!componentToDuplicate) return false;

        const dupComp = this.cloneComponent(componentToDuplicate);

        const entries = Object.entries(section.content);
        const targetIndex = entries.findIndex(([key]) => key === componentId);
        if (targetIndex !== -1) {
            entries.splice(targetIndex + 1, 0, [dupComp.id, dupComp as C]);
            section.content = Object.fromEntries(entries);
            this.mergeAdjacentTextComponents(sectionId);
            return dupComp.id;
        }
        return null;
    }

    /** Deletes a component from a section */
    deleteComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return false;
        
        const componentToDelete = section.content[componentId];
        const separator = componentToDelete?.mode === 'block' ? '\n' : ' ';

        const newContent = { ...section.content };
        delete newContent[componentId];
        section.content = newContent;
        
        this.mergeAdjacentTextComponents(sectionId, undefined, separator);
        
        return true;
    }


    /** Add a new component to a section. If componentId is null, the component will be appended to the end */
    addComponent(sectionId: string, componentId: string | null, componentType: string, replaceComponent: boolean = false, overrideValue?: DataValue) {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return null;

        // Generate a new id and build the component
        const newId = generateRandomId(componentType);
        const emptyComponent = globalRegistry.getEmptyComponent(componentType);
        const initialValue = globalRegistry.getInitialComponentValue(componentType);

        // Generate a default value based on the value type
        const value = generateDefaultDataValue(emptyComponent.value, initialValue);

        const newComponent = {
            ...emptyComponent,
            id: newId,
            value: overrideValue !== undefined ? overrideValue : value,
        } as C;

        // If no target component is specified, just append to the end
        if (!componentId) {
            section.content[newId] = newComponent;
            return this.mergeAdjacentTextComponents(sectionId, newId) || newId;
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
            return this.mergeAdjacentTextComponents(sectionId, newId) || newId;
        } else {
            console.warn("Insertion next to nested components is not fully supported yet or component not found. Appending to the end.");
            section.content[newId] = newComponent;
            return this.mergeAdjacentTextComponents(sectionId, newId) || newId;
        }
    }

    /** Merges adjacent text components into a single text component and returns the ID of the merged component if targetId was merged into it */
    private mergeAdjacentTextComponents(sectionId: string, targetId?: string, separator: string = ''): string | undefined {
        const section = this.findSection(sectionId) as ParagraphSection<C> | null;
        if (!section) return undefined;

        const entries = Object.entries(section.content);
        if (entries.length < 2) return undefined;

        const newEntries: [string, C][] = [];
        let i = 0;
        let resultingTargetId: string | undefined = undefined;

        while (i < entries.length) {
            const currentId = entries[i][0];
            let currentComp = entries[i][1];
            
            if (currentComp.type === 'text') {
                let mergedText = (currentComp.value as StringValue).value;
                let j = i + 1;
                
                let didMergeTarget = currentId === targetId;

                while (j < entries.length && entries[j][1].type === 'text') {
                    const [nextId, nextComp] = entries[j];
                    const nextText = (nextComp.value as StringValue).value;
                    
                    if (separator) {
                        if (mergedText && nextText) {
                            if (separator === ' ') {
                                if (!mergedText.endsWith(' ') && !nextText.startsWith(' ')) {
                                    mergedText += ' ';
                                }
                            } else if (separator === '\n') {
                                if (!mergedText.endsWith('\n') && !nextText.startsWith('\n')) {
                                    mergedText += '\n';
                                }
                            }
                        }
                    }
                    mergedText += nextText;
                    
                    if (nextId === targetId) {
                        didMergeTarget = true;
                    }
                    j++;
                }
                
                if (j > i + 1) {
                    currentComp = {
                        ...currentComp,
                        value: { type: 'string', value: mergedText }
                    } as C;
                }
                
                if (didMergeTarget) {
                    resultingTargetId = currentId;
                }

                newEntries.push([currentId, currentComp]);
                i = j;
            } else {
                newEntries.push([currentId, currentComp]);
                i++;
            }
        }

        if (newEntries.length !== entries.length) {
            section.content = Object.fromEntries(newEntries);
        }
        
        return resultingTargetId;
    }


    /* * BINDINGS MANAGEMENT * */

    addBinding(definition: BindingsDefinition) {
        // Add the new binding to the document
        const newId = generateRandomId("binding");
        this.bindings[newId] = definition;

        // Also initialize the binding value in the data store
        bindingStore.addBinding(newId, definition);

        return newId;
    }

    setBindingInitialValue(bindingId: string, initialValue: PrimitiveValue | CollectionValue) {
        if (!this.bindings[bindingId]) {
            console.warn(`Binding with id ${bindingId} does not exist.`);
            return false;
        }
        /* Currently we do not check if the binding is changing its type
        const currentBinding = this.bindings[bindingId];

        // Note: When treating with empty values we allow switching the binding type without warning
        if (initialValue.type !== 'empty' && currentBinding.type !== 'empty' && currentBinding.type !== initialValue.type) {
            console.warn(`Initial value type ${initialValue.type} does not match binding type ${currentBinding.type}.`);
            return false;
        }*/

        this.bindings[bindingId].initialValue = initialValue.value;
        this.bindings[bindingId].type = initialValue.type;
        return true;
    }
}

export const editStore = new EditStore();
