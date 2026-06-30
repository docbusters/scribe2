import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
import type { Document } from "../domain/Document.js";

/** 
 * Represents the usages of each custom binding:
 * - Outer key: binding type
 * - Inner key: binding id
 * - Value: set of component ids that use this binding
 */
export type CustomBindingUsages = Record<string, Record<string, Set<string>>>;

export function calculateDocumentBindingUsages<C extends BaseComponent<string, DataValue, ComponentConfig | undefined>>(
    document: Document<C>
): CustomBindingUsages {
    const usages: CustomBindingUsages = {};

    if (!document) return usages;

    for (const section of Object.values(document.sections)) {
        if ('content' in section && section.content) {
            for (const [componentId, component] of Object.entries(section.content)) {
                extractBindingUsages(usages, componentId, (component as C).value, true);
            }
        }
    }

    return usages;
}

export function extractBindingUsages(
    usages: CustomBindingUsages,
    componentId: string,
    value: DataValue,
    add: boolean
) {
    if (!value) return;

    if (value.type === 'binding' && value.bindingType !== 'default') {
        if (add) {
            if (!usages[value.bindingType]) {
                usages[value.bindingType] = {};
            }
            if (!usages[value.bindingType][value.value]) {
                usages[value.bindingType][value.value] = new Set<string>();
            }
            usages[value.bindingType][value.value].add(componentId);
        } else {
            usages[value.bindingType]?.[value.value]?.delete(componentId);
        }
    } else if (value.type === 'component') {
        const nestedComponent = value.value as BaseComponent<string, DataValue, ComponentConfig>;
        extractBindingUsages(usages, nestedComponent.id, nestedComponent.value, add);
    } else if (value.type === 'array') {
        for (const item of value.value) {
            extractBindingUsages(usages, componentId, item as DataValue, add);
        }
    } else if (value.type === 'record') {
        for (const item of Object.values(value.value)) {
            extractBindingUsages(usages, componentId, item as DataValue, add);
        }
    }
}
