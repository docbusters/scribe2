import type { ComponentRegistry } from "../registry/ComponentRegistry.js";
import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";

type UnknownComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

class GlobalRegistry {
    components = $state<ComponentRegistry<UnknownComponent>>({} as ComponentRegistry<UnknownComponent>);

    initialize<T extends UnknownComponent>(customComponents: ComponentRegistry<T>) {
        this.components = customComponents as ComponentRegistry<UnknownComponent>;
    }

    getComponent(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp.component;
    }

    getEmptyComponent(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp.empty;
    }

    getInitialComponentValue(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp.initialValue;
    }

    getComponentValueTypes(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp.valueTypes;
    }

    getComponentOptions(type: string) {
        const comp = this.components[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp.options;
    }
}

export const globalRegistry = new GlobalRegistry();
