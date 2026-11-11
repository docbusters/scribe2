import type { ComponentRegistry } from "../registry/ComponentRegistry.js";
import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
import { getShortcutWarnings } from "../utils/shortcuts.js";

type UnknownComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

class GlobalRegistry {
    components = $state<ComponentRegistry<UnknownComponent>>({} as ComponentRegistry<UnknownComponent>);

    initialize<T extends UnknownComponent>(customComponents: ComponentRegistry<T>) {
        this.components = customComponents as ComponentRegistry<UnknownComponent>;

        // Reads the argument, not the state: the effect that initializes the registry must not depend on what it writes
        for (const [type, component] of Object.entries(customComponents)) {
            for (const warning of getShortcutWarnings(type, component.options ?? [])) {
                console.warn(warning);
            }
        }
    }

    getComponent(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp;
    }

    getEmptyComponent(type: string) {
        return this.getComponent(type).empty;
    }

    getInitialComponentValue(type: string) {
        return this.getComponent(type).initialValue;
    }

    getComponentValueTypes(type: string) {
        return this.getComponent(type).valueTypes;
    }

    getComponentSupportedBindingValueTypes(type: string) {
        return this.getComponent(type).supportedBindingValueTypes || [];
    }

    /** Height definition of a component, or null if the component is as tall as its content */
    getComponentHeight(type: string) {
        const { height, isResizeable } = this.getComponent(type);
        return height ? { ...height, isResizeable: !!isResizeable } : null;
    }

    getComponentOptions(type: string) {
        return this.getComponent(type).options;
    }
}

export const globalRegistry = new GlobalRegistry();
