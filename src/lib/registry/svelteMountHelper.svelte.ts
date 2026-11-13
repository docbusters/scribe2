import { mount, unmount, type Component } from 'svelte';
import type { BindingItemProps, BindingItemRenderer } from '../types/ScribeProps.js';

export type InstanceData<TProps> = {
    instance: Record<string, unknown>;
    propsState: TProps;
};

export function createSvelte5Mount<TProps extends object>(SvelteComponent: Component<TProps>) {
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

/**
 * Adapts a Svelte component to `CustomBinding.renderItem`, which draws a row of a custom binding. The component gets the props of the row
 * (`BindingItemProps`), mounted into the node it is given and updated in place when they change
 */
export function createSvelteItemRenderer(SvelteComponent: Component<BindingItemProps>): BindingItemRenderer {
    const component = createSvelte5Mount<BindingItemProps>(SvelteComponent);

    return (node, props) => {
        const instance = component.mount(node, props);
        return {
            update: (next) => component.update(instance, next),
            destroy: () => component.unmount(instance)
        };
    };
}
