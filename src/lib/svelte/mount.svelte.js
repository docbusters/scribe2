// Published as source (`@antonii22/scribe2/svelte`), not bundled into `scribe.js`: the host compiles it with its own Svelte, so the components
// it mounts and the runtime that mounts them are the same. It may only import `svelte`, never anything from Scribe (see `mount.test.ts`)
import { mount, unmount } from 'svelte';

/**
 * Adapts a Svelte component to the `mount`, `update` and `unmount` of a registry entry (`ComponentRegistry`).
 * A component mounted by Scribe is a new root, so it does not inherit the Svelte context of the host: pass it in `context`
 * (for example `getAllContexts()` read while a component initialises).
 * @template {object} TProps
 * @param {import('svelte').Component<TProps>} SvelteComponent
 * @param {Map<unknown, unknown>} [context]
 */
export function createSvelte5Mount(SvelteComponent, context) {
    return {
        /**
         * @param {HTMLElement} node
         * @param {TProps} props
         * @returns {import('./mount.svelte.js').InstanceData<TProps>}
         */
        mount: (node, props) => {
            // Create a reactive state for props to enable reactivity
            const propsState = $state({ ...props });

            const instance = mount(SvelteComponent, {
                target: node,
                props: propsState,
                context
            });

            return { instance, propsState };
        },
        /**
         * @param {import('./mount.svelte.js').InstanceData<TProps>} instanceData
         * @param {TProps} newProps
         */
        update: (instanceData, newProps) => {
            // Assign new props to the current reactive state to trigger updates
            Object.assign(instanceData.propsState, newProps);
        },
        /** @param {import('./mount.svelte.js').InstanceData<TProps>} instanceData */
        unmount: (instanceData) => {
            unmount(instanceData.instance);
        }
    };
}

/**
 * Adapts a Svelte component to `CustomBinding.renderItem`, which draws a row of a custom binding. The component gets the props of the row
 * (`BindingItemProps`), mounted into the node it is given and updated in place when they change.
 * `context` is the Svelte context the component can read, as in `createSvelte5Mount`
 * @param {import('svelte').Component<import('../types/ScribeProps.js').BindingItemProps>} SvelteComponent
 * @param {Map<unknown, unknown>} [context]
 * @returns {import('../types/ScribeProps.js').BindingItemRenderer}
 */
export function createSvelteItemRenderer(SvelteComponent, context) {
    const component = createSvelte5Mount(SvelteComponent, context);

    return (node, props) => {
        const instance = component.mount(node, props);
        return {
            update: (next) => component.update(instance, next),
            destroy: () => component.unmount(instance)
        };
    };
}
