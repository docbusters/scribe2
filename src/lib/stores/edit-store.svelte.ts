import type { BaseComponent, BlockComponent, ComponentConfig, SlotRef } from "../domain/components/Component.js";
import type { CollectionValue, DataValue, PrimitiveValue } from "../domain/data/DataValue.js";
import type { BindingsDefinition, Document } from "../domain/Document.js";
import type { Section } from "../domain/Section.js";
import { generateDefaultDataValue } from "../utils/generateDefaultDataValue.js";
import { generateRandomId } from "../utils/generateRandomId.js";
import { bindingStore } from "./binding-store.svelte.js";
import { globalRegistry } from "./global-registry.svelte.js";
import { calculateDocumentBindingUsages, extractBindingUsages, getDefaultBindingUsages, type CustomBindingUsages } from "../utils/bindingUsages.js";
import { findSlotOf, readSlotEntries, rekeySlotContents, toSlotValue } from "../utils/componentSlots.js";
import { mergeAdjacentTexts } from "../utils/textMerge.js";

/** Handles document and binding modifications when the document is in edit mode */
class EditStore<C extends BaseComponent<string, DataValue, ComponentConfig | undefined>> {
    document = $state<Document<C>>(null!);
    bindings = $state<Record<string, BindingsDefinition>>({});

    /** Section that has just been added and should receive the caret once it is rendered */
    sectionToFocus = $state<string | null>(null);

    customBindingUsages: CustomBindingUsages = {};

    initialize(document: Document<C>, bindings: Record<string, BindingsDefinition>) {
        this.document = document;
        this.bindings = bindings;
        this.customBindingUsages = calculateDocumentBindingUsages(this.document);
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
    addSectionBelow(sectionId: string | null, title?: string) {
        const newSectionId = generateRandomId("section");
        const newSection = {
            id: newSectionId,
            title,
            content: {}
        } as Document<C>["sections"][string];

        const newSections: typeof this.document.sections = {};

        if (sectionId === null) {
            this.document.sections = { [newSectionId]: newSection, ...this.document.sections };
            this.sectionToFocus = newSectionId;
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
        this.sectionToFocus = newSectionId;
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

            extractBindingUsages(this.customBindingUsages, dupComp.id, dupComp.value, true);
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
        
        for (const [componentId, component] of Object.entries(section.content)) {
            extractBindingUsages(this.customBindingUsages, componentId, (component as C).value, false);
        }

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
    getComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as Section<C> | null;
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

    /** Assigns new IDs, in place, to every component nested at any depth inside a value */
    private reassignNestedIds(value: DataValue) {
        if (!value) return;

        if (value.type === "component") {
            const nestedComp = value.value;
            nestedComp.id = generateRandomId(nestedComp.type);
            this.reassignNestedIds(nestedComp.value);
        } else if (value.type === "array") {
            for (const item of value.value) {
                this.reassignNestedIds(item);
            }
        } else if (value.type === "record") {
            for (const item of Object.values(value.value)) {
                this.reassignNestedIds(item);
            }
        }
    }

    /**
     * Deep clones a component and assigns it a new ID, so the copy shares no state with the original.
     * Components nested in its value also receive new IDs.
     */
    private cloneComponent(comp: BaseComponent<string, DataValue, ComponentConfig | undefined>): BaseComponent<string, DataValue, ComponentConfig | undefined> {
        const clonedComponent = structuredClone($state.snapshot(comp)) as BaseComponent<string, DataValue, ComponentConfig | undefined>;
        clonedComponent.id = generateRandomId(comp.type);
        this.reassignNestedIds(clonedComponent.value);
        // The components of a slot are keyed by their ids, which have just changed
        rekeySlotContents(clonedComponent.value);
        return clonedComponent;
    }

    /* * CONTAINERS * */
    // The components of a section are in section.content, and the ones nested in a component are in its slots. Every
    // operation that inserts, removes or moves components resolves the container first, so it works in both

    /** Where a component is stored: null for the content of the section, the slot that holds it, or undefined if it is not found */
    private locate(section: Section<C>, componentId: string): SlotRef | null | undefined {
        return findSlotOf(section.content as Record<string, BaseComponent<string, DataValue, ComponentConfig | undefined>>, componentId);
    }

    /** The components of the content of a section (slot is null) or of a slot, in order. Null if the slot is not valid */
    private readEntries(section: Section<C>, slot: SlotRef | null): [string, C][] | null {
        if (!slot) return Object.entries(section.content);

        const parent = this.getComponent(section.id, slot.parentId);
        if (!parent) return null;
        return readSlotEntries(parent.value, slot.slotKey) as [string, C][] | null;
    }

    /** Replaces the components of the content of a section (slot is null) or of a slot */
    private writeEntries(section: Section<C>, slot: SlotRef | null, entries: [string, C][]): boolean {
        if (!slot) {
            section.content = Object.fromEntries(entries);
            return true;
        }

        const parent = this.getComponent(section.id, slot.parentId);
        if (!parent || parent.value.type !== 'record') return false;
        parent.value.value[slot.slotKey] = toSlotValue(entries);
        return true;
    }

    getComponentValue(sectionId: string, componentId: string) {
        const component = this.getComponent(sectionId, componentId);
        if (!component) return null;
        return component.value;
    }

    setComponentValue(sectionId: string, componentId: string, newValue: DataValue) {
        const component = this.getComponent(sectionId, componentId);
        if (!component) return false;

        // Verify if the new value is supported
        if (!globalRegistry.getComponentValueTypes(component.type).includes(newValue.type)) {
            console.warn(`Value type ${newValue.type} is not supported for component type ${component.type}`);
            return false;
        }

        // TODO: Verifiy the value with more detail

        // Check if the old value was a custom binding and if we need to remove it from the usages
        extractBindingUsages(this.customBindingUsages, componentId, component.value, false);

        component.value = newValue;
        
        // When setting a new custom binding we register the custom binding as being used
        extractBindingUsages(this.customBindingUsages, componentId, newValue, true);

        return true;
    }

    getComponentConfig(sectionId: string, componentId: string) {
        const component = this.getComponent(sectionId, componentId);
        if (!component) return null;
        return component.config;
    }

    setComponentConfig(sectionId: string, componentId: string, newConfig: ComponentConfig) {
        const component = this.getComponent(sectionId, componentId);
        if (!component) return false;
        component.config = newConfig;
        return true;
    }

    /** Sets the height in px of a block component. Returns false if the component is not found or is not a block */
    setComponentHeight(sectionId: string, componentId: string, height: number) {
        const component = this.getComponent(sectionId, componentId);
        if (!component || component.mode !== 'block') return false;
        (component as BlockComponent<string, DataValue, ComponentConfig | undefined>).height = height;
        return true;
    }

    /** Duplicates a component within a section and adds it right after the original component */
    duplicateComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as Section<C> | null;
        if (!section) return false;
        const componentToDuplicate = this.getComponent(sectionId, componentId);
        if (!componentToDuplicate) return false;

        const slot = this.locate(section, componentId);
        if (slot === undefined) return null;
        const entries = this.readEntries(section, slot);
        if (!entries) return null;

        const dupComp = this.cloneComponent(componentToDuplicate);

        const targetIndex = entries.findIndex(([key]) => key === componentId);
        if (targetIndex !== -1) {
            entries.splice(targetIndex + 1, 0, [dupComp.id, dupComp as C]);
            this.writeEntries(section, slot, entries);
            this.mergeAdjacentTextComponents(sectionId, slot);

            extractBindingUsages(this.customBindingUsages, dupComp.id, dupComp.value, true);

            return dupComp.id;
        }
        return null;
    }

    /** Deletes a component from a section, or from the slot of a component that holds it */
    deleteComponent(sectionId: string, componentId: string) {
        const section = this.findSection(sectionId) as Section<C> | null;
        if (!section) return false;

        const slot = this.locate(section, componentId);
        if (slot === undefined) return false;
        const entries = this.readEntries(section, slot);
        if (!entries) return false;

        const index = entries.findIndex(([id]) => id === componentId);
        if (index === -1) return false;

        const [, componentToDelete] = entries[index];
        const separator = componentToDelete.mode === 'block' ? '\n' : ' ';
        extractBindingUsages(this.customBindingUsages, componentId, componentToDelete.value, false);

        entries.splice(index, 1);
        this.writeEntries(section, slot, entries);

        this.mergeAdjacentTextComponents(sectionId, slot, undefined, separator);

        return true;
    }

    /**
     * Inserts a new component with support for positional placement (before, after, replace)
     * and text component splitting (splitting a text component into textBefore + newComponent + textAfter).
     * The component goes next to componentId, in the section or the slot that holds it. If componentId is null it is appended to the end
     * of options.slot (the content of the section when it is not given).
     * Returns an object with the new component ID and the ID of the text component immediately to its right (if any).
     */
    insertComponent(
        sectionId: string,
        componentId: string | null,
        componentType: string,
        options?: {
            mode?: 'after' | 'before' | 'replace' | 'split';
            splitData?: { textBefore: string; textAfter: string };
            overrideValue?: DataValue;
            /** Where to append when there is no componentId */
            slot?: SlotRef | null;
        }
    ): { newId: string; rightTextId: string } | null {
        const mode = options?.mode || 'after';
        const section = this.findSection(sectionId) as Section<C> | null;
        if (!section) return null;

        const slot = componentId ? this.locate(section, componentId) : (options?.slot ?? null);
        if (slot === undefined) {
            console.warn("Component not found for insertion:", componentId);
            return null;
        }
        const entries = this.readEntries(section, slot);
        if (!entries) {
            console.warn("Invalid slot for insertion:", slot);
            return null;
        }

        // If split mode is requested with valid split data and target component exists
        if (mode === 'split' && options?.splitData && componentId) {
            const targetIndex = entries.findIndex(([key]) => key === componentId);
            if (targetIndex !== -1) {
                const [targetId, targetComp] = entries[targetIndex];

                // 1. Update the existing text component with textBefore
                const updatedTargetComp = {
                    ...targetComp,
                    value: { type: 'string', value: options.splitData.textBefore }
                } as C;
                entries[targetIndex] = [targetId, updatedTargetComp];

                // 2. Create the newly inserted component
                const newId = generateRandomId(componentType);
                const emptyComponent = globalRegistry.getEmptyComponent(componentType);
                const initialValue = globalRegistry.getInitialComponentValue(componentType);
                const value = generateDefaultDataValue(emptyComponent.value, initialValue, componentType);
                const newComponent = {
                    ...emptyComponent,
                    id: newId,
                    value: options.overrideValue !== undefined ? options.overrideValue : value,
                } as C;

                // 3. Create the trailing text component with textAfter
                const newTextId = generateRandomId('text');
                const emptyTextComp = globalRegistry.getEmptyComponent('text');
                const newTextComp = {
                    ...emptyTextComp,
                    id: newTextId,
                    value: { type: 'string', value: options.splitData.textAfter }
                } as C;

                // 4. Splice both new components immediately after targetIndex
                entries.splice(targetIndex + 1, 0, [newId, newComponent], [newTextId, newTextComp]);
                this.writeEntries(section, slot, entries);

                // 5. Track bindings
                extractBindingUsages(this.customBindingUsages, newId, newComponent.value, true);
                extractBindingUsages(this.customBindingUsages, newTextId, newTextComp.value, true);

                return { newId, rightTextId: newTextId };
            }
        }

        // Build the new component
        const newId = generateRandomId(componentType);
        const emptyComponent = globalRegistry.getEmptyComponent(componentType);
        const initialValue = globalRegistry.getInitialComponentValue(componentType);
        const value = generateDefaultDataValue(emptyComponent.value, initialValue, componentType);
        const newComponent = {
            ...emptyComponent,
            id: newId,
            value: options?.overrideValue !== undefined ? options.overrideValue : value,
        } as C;

        // If no target component is specified, append to the end
        if (!componentId) {
            entries.push([newId, newComponent]);
            this.writeEntries(section, slot, entries);
            extractBindingUsages(this.customBindingUsages, newId, newComponent.value, true);
            const resultingId = this.mergeAdjacentTextComponents(sectionId, slot, newId) || newId;
            return { newId: resultingId, rightTextId: '' };
        }

        const targetIndex = entries.findIndex(([key]) => key === componentId);
        if (targetIndex === -1) return null;

        if (mode === 'replace') {
            const [oldId, oldComponent] = entries[targetIndex];
            extractBindingUsages(this.customBindingUsages, oldId, oldComponent.value, false);
            entries.splice(targetIndex, 1, [newId, newComponent]);
        } else if (mode === 'before') {
            if (options?.splitData?.textAfter !== undefined) {
                const [targetId, targetComp] = entries[targetIndex];
                entries[targetIndex] = [targetId, {
                    ...targetComp,
                    value: { type: 'string', value: options.splitData.textAfter }
                } as C];
            }
            entries.splice(targetIndex, 0, [newId, newComponent]);
        } else {
            if (options?.splitData?.textBefore !== undefined) {
                const [targetId, targetComp] = entries[targetIndex];
                entries[targetIndex] = [targetId, {
                    ...targetComp,
                    value: { type: 'string', value: options.splitData.textBefore }
                } as C];
            }
            entries.splice(targetIndex + 1, 0, [newId, newComponent]);
        }
        this.writeEntries(section, slot, entries);
        extractBindingUsages(this.customBindingUsages, newId, newComponent.value, true);
        const resultingNewId = this.mergeAdjacentTextComponents(sectionId, slot, newId) || newId;

        // Find the first text component to the right of the newly inserted component
        const updatedEntries = this.readEntries(section, slot) ?? [];
        const newIndex = updatedEntries.findIndex(([key]) => key === resultingNewId);
        const rightTextEntry = newIndex !== -1
            ? updatedEntries.slice(newIndex + 1).find(([, comp]) => comp.type === 'text')
            : undefined;
        const rightTextId = rightTextEntry ? rightTextEntry[0] : '';

        return { newId: resultingNewId, rightTextId };
    }

    /**
     * Merges adjacent text components of a section (slot is null) or of a slot into a single text component and returns
     * the ID of the merged component if targetId was merged into it. The rules are in `mergeAdjacentTexts` (`utils/textMerge.ts`, tested)
     */
    private mergeAdjacentTextComponents(sectionId: string, slot: SlotRef | null, targetId?: string, separator: '' | ' ' | '\n' = ''): string | undefined {
        const section = this.findSection(sectionId) as Section<C> | null;
        if (!section) return undefined;

        const entries = this.readEntries(section, slot);
        if (!entries || entries.length < 2) return undefined;

        const merged = mergeAdjacentTexts(entries, targetId, separator);
        if (merged.entries.length !== entries.length) {
            this.writeEntries(section, slot, merged.entries);
        }

        return merged.targetId;
    }


    /* * BINDINGS MANAGEMENT * */

    addBinding(definition: BindingsDefinition, componentType?: string) {
        // Generate a unique id
        const prefix = componentType ? `${componentType}` : "";
        let counter = 1;
        let newId = `${prefix}-${counter}`;
        while (this.bindings[newId]) {
            counter++;
            newId = `${prefix}-${counter}`;
        }

        // Add the new binding to the document
        this.bindings[newId] = definition;

        // Also initialize the binding value in the data store
        bindingStore.addBinding(newId, definition);
        bindingStore.notifyBindingCreated(newId, definition);

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

    /** Creates a new default binding with the given id and definition */
    createBinding(id: string, definition: BindingsDefinition): boolean {
        if (!id || this.bindings[id]) {
            console.warn(`Binding with id "${id}" already exists or is invalid.`);
            return false;
        }

        this.bindings[id] = definition;
        bindingStore.addBinding(id, definition);
        bindingStore.notifyBindingCreated(id, definition);
        return true;
    }

    /** Ids of the components that use a default binding, so deleting it can warn about what it would break */
    getBindingUsages(bindingId: string): string[] {
        return getDefaultBindingUsages(this.document, bindingId);
    }

    /** Deletes an existing default binding */
    deleteBinding(bindingId: string): boolean {
        if (!this.bindings[bindingId]) {
            console.warn(`Binding with id "${bindingId}" does not exist.`);
            return false;
        }

        delete this.bindings[bindingId];
        bindingStore.removeBinding(bindingId);
        bindingStore.notifyBindingDeleted(bindingId);
        return true;
    }
}

export const editStore = new EditStore();
