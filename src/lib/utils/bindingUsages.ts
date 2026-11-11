import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { BindingValue, DataValue } from "../domain/data/DataValue.js";
import type { Document } from "../domain/Document.js";

/**
 * Represents the usages of each custom binding:
 * - Outer key: binding type
 * - Inner key: binding id
 * - Value: set of component ids that use this binding
 */
export type CustomBindingUsages = Record<string, Record<string, Set<string>>>;

/** Calls visit for every binding inside a value, with the id of the component that holds it (a nested component holds its own) */
function forEachBindingValue(
    componentId: string,
    value: DataValue,
    visit: (componentId: string, binding: BindingValue) => void
) {
    if (!value) return;

    if (value.type === 'binding') {
        visit(componentId, value);
    } else if (value.type === 'component') {
        const nestedComponent = value.value as BaseComponent<string, DataValue, ComponentConfig>;
        forEachBindingValue(nestedComponent.id, nestedComponent.value, visit);
    } else if (value.type === 'array') {
        for (const item of value.value) {
            forEachBindingValue(componentId, item as DataValue, visit);
        }
    } else if (value.type === 'record') {
        for (const item of Object.values(value.value)) {
            forEachBindingValue(componentId, item as DataValue, visit);
        }
    }
}

export function calculateDocumentBindingUsages<C extends BaseComponent<string, DataValue, ComponentConfig | undefined>>(
    document: Document<C>
): CustomBindingUsages {
    const usages: CustomBindingUsages = {};

    if (!document) return usages;

    for (const section of Object.values(document.sections)) {
        for (const [componentId, component] of Object.entries(section.content)) {
            extractBindingUsages(usages, componentId, (component as C).value, true);
        }
    }

    return usages;
}

/**
 * The ids of the components that use a default binding, without repeats. Usages of default bindings are not part of
 * CustomBindingUsages (a public type), so they are found by walking the document when they are needed
 */
export function getDefaultBindingUsages<C extends BaseComponent<string, DataValue, ComponentConfig | undefined>>(
    document: Document<C>,
    bindingId: string
): string[] {
    const componentIds = new Set<string>();

    if (!document) return [];

    for (const section of Object.values(document.sections)) {
        for (const [componentId, component] of Object.entries(section.content)) {
            forEachBindingValue(componentId, (component as C).value, (holderId, binding) => {
                if (binding.bindingType === 'default' && binding.value === bindingId) {
                    componentIds.add(holderId);
                }
            });
        }
    }

    return [...componentIds];
}

export function extractBindingUsages(
    usages: CustomBindingUsages,
    componentId: string,
    value: DataValue,
    add: boolean
) {
    forEachBindingValue(componentId, value, (holderId, binding) => {
        if (binding.bindingType === 'default') return;

        if (add) {
            if (!usages[binding.bindingType]) {
                usages[binding.bindingType] = {};
            }
            if (!usages[binding.bindingType][binding.value]) {
                usages[binding.bindingType][binding.value] = new Set<string>();
            }
            usages[binding.bindingType][binding.value].add(holderId);
        } else {
            usages[binding.bindingType]?.[binding.value]?.delete(holderId);
        }
    });
}
