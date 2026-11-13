import type { Component } from 'svelte';
import type { BindingItemRenderer, BindingItemProps } from '../types/ScribeProps.js';

export type InstanceData<TProps> = {
    instance: Record<string, unknown>;
    propsState: TProps;
};

/**
 * Adapts a Svelte component to the `mount`, `update` and `unmount` of a registry entry (`ComponentRegistry`).
 * A component mounted by Scribe is a new root, so it does not inherit the Svelte context of the host: pass it in `context`
 * (for example `getAllContexts()` read while a component initialises)
 */
export function createSvelte5Mount<TProps extends object>(
    SvelteComponent: Component<TProps>,
    context?: Map<unknown, unknown>
): {
    mount: (node: HTMLElement, props: TProps) => InstanceData<TProps>;
    update: (instanceData: InstanceData<TProps>, newProps: TProps) => void;
    unmount: (instanceData: InstanceData<TProps>) => void;
};

/**
 * Adapts a Svelte component to `CustomBinding.renderItem`, which draws a row of a custom binding. The component gets the props of the row
 * (`BindingItemProps`), mounted into the node it is given and updated in place when they change.
 * `context` is the Svelte context the component can read, as in `createSvelte5Mount`
 */
export function createSvelteItemRenderer(
    SvelteComponent: Component<BindingItemProps>,
    context?: Map<unknown, unknown>
): BindingItemRenderer;
