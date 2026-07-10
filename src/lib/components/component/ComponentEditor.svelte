<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
	import { defaultComponentOptions, type ComponentEditOptions, type BaseComponentEditOptions } from "$lib/registry/ComponentEditOptions.js";
	import ComponentEditorButton from "./ComponentEditorButton.svelte";
    import { mount, unmount } from "svelte";
	import type { DataValue } from "$lib/domain/data/DataValue.js";
	import type { ComponentConfig } from "$lib/domain/components/Component.js";

    interface ComponentEditorProps extends HTMLAttributes<HTMLDivElement> {
        componentType: string;
        componentValue: DataValue;
        isBinding: boolean;
        componentConfig?: ComponentConfig;
        sectionId: string;
        componentId: string;
        disabled?: boolean;
        options?: ComponentEditOptions[];
        disabledOptions: string[];
    }

    let { componentType, isBinding, componentValue, componentConfig, sectionId, componentId, disabled = false, class: className, options = defaultComponentOptions, disabledOptions,  ...restProps }: ComponentEditorProps = $props();

    let containerElement = $state<HTMLElement | null>(null);

    $effect(() => {
        if (!containerElement) return;

        const cleanups: (() => void)[] = [];

        options.forEach(option => {
            // Check if we need to render a separator
            if (option.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'component-editor-separator';
                containerElement!.appendChild(sep);
                cleanups.push(() => sep.remove());
                return;
            }

            const baseOption = option as BaseComponentEditOptions;
            if (baseOption.props) {
                // If a custom render function is provided, use it to render the option
                if (baseOption.render) {
                    const cleanup = baseOption.render(containerElement!, {
                        componentType,
                        componentValue,
                        sectionId,
                        componentId,
                        disabled: disabled || disabledOptions.includes(baseOption.type),
                        name: baseOption.name,
                        onclick: baseOption.props.onclick,
                        icon: baseOption.props.icon,
                        isBinding,
                        isSelected: baseOption.isSelected ? baseOption.isSelected({ value: componentValue, config: componentConfig }) : false
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
                            disabled: disabled || disabledOptions.includes(baseOption.type),
                            name: baseOption.name,
                            onclick: (e) => baseOption.props!.onclick?.({ event: e, sectionId, componentId }),
                            icon: baseOption.props.icon,
                            isSelected: baseOption.isSelected ? baseOption.isSelected({ value: componentValue, config: componentConfig }) : false
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
        align-items: center;
        justify-content: center;
    }
    
    :global(.component-editor-separator) {
        width: 1px;
        height: 1.25rem;
        background-color: var(--scribe-border-color);
        margin: 0 0.125rem;
    }
</style>
