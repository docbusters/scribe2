import type { ComponentRegistry, ScribeComponentProps } from "$lib/registry/ComponentRegistry.js";
import type { Component } from "svelte";
import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";

type UnknownComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

class GlobalRegistry {
    components = $state<ComponentRegistry>();

    initialize<T extends UnknownComponent>(customComponents: ComponentRegistry<T>) {
        this.components = customComponents as unknown as ComponentRegistry;
    }

    getComponent(type: string): Component<ScribeComponentProps<UnknownComponent>> {
        const comp = (this.components as unknown as Record<string, Component<ScribeComponentProps<UnknownComponent>>>)[type];
        if (!comp) {
            throw new Error(`Component of type ${type} not found in registry`);
        }
        return comp;
    }
}

export const globalRegistry = new GlobalRegistry();
