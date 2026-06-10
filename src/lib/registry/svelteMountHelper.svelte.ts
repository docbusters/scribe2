import { mount, unmount, type Component } from 'svelte';
import type { ScribeComponentProps } from './ComponentRegistry.ts';
import type { BaseComponent, ComponentConfig } from '$lib/domain/components/Component.js';
import type { DataValue } from '$lib/domain/data/DataValue.js';

export type InstanceData<TProps> = {
    instance: Record<string, unknown>;
    propsState: TProps;
};

export function createSvelte5Mount<TProps extends ScribeComponentProps<BaseComponent<string, DataValue, ComponentConfig>>>(SvelteComponent: Component<TProps>) {
    return {
        mount: (node: HTMLElement, props: TProps) => {
            // Create a reactive state for props to enable reactivity
            const propsState = $state({ ...props });
            
            const instance = mount(SvelteComponent, { 
                target: node, 
                props: propsState 
            });

            return { instance, propsState } as InstanceData<TProps>;
        },
        update: (instanceData: InstanceData<TProps>, newProps: TProps) => {
            // Assign new props to the current reactive state to trigger updates
            Object.assign(instanceData.propsState, newProps);
        },
        unmount: (instanceData: InstanceData<TProps>) => {
            unmount(instanceData.instance);
        }
    };
}
