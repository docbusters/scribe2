<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
	import { defaultComponentOptions, type ComponentEditOptions } from "$lib/registry/ComponentEditOptions.js";
	import ComponentEditorButton from "./ComponentEditorButton.svelte";
    import { mount, unmount } from "svelte";

    interface ComponentEditorProps extends HTMLAttributes<HTMLDivElement> {
        componentType: string;
        sectionId: string;
        componentId: string;
        disabled?: boolean;
        options?: ComponentEditOptions[];
    }

    let { componentType, sectionId, componentId, disabled = false, class: className, options = defaultComponentOptions, ...restProps }: ComponentEditorProps = $props();

    let containerElement = $state<HTMLElement | null>(null);

    $effect(() => {
        if (!containerElement) return;

        const cleanups: (() => void)[] = [];

        options.forEach(option => {
            if (option.props) {
                // If a custom render function is provided, use it to render the option
                if (option.render) {
                    const cleanup = option.render(containerElement!, {
                        componentType,
                        sectionId,
                        componentId,
                        disabled,
                        name: option.name,
                        onclick: option.props.onclick,
                        icon: option.props.icon,
                    });
                    if (cleanup) {
                        cleanups.push(cleanup);
                    }
                } else {
                    // Otherwise, render a default button for the option
                    const app = mount(ComponentEditorButton, {
                        target: containerElement!,
                        props: {
                            sectionId,
                            componentId,
                            disabled,
                            name: option.name,
                            onclick: (e) => option.props!.onclick?.({ event: e, sectionId, componentId }),
                            icon: option.props.icon
                        }
                    });
                    cleanups.push(() => unmount(app));
                }
            }
        });

        return () => {
            cleanups.forEach(c => c());
        };
    });
</script>

<div bind:this={containerElement} class={`component-editor-container ${className || ''}`} {...restProps}>
</div>

<style>
    .component-editor-container {
        background-color: var(--scribe-popover);
        border-radius: var(--scribe-radius-lg);
        border: 1px solid var(--scribe-border-color);
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        padding: 0.25rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        width: fit-content;
        align-items: center;
        justify-content: center;
    }
</style>
