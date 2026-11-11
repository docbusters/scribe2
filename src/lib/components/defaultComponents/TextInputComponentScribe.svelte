<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextInputComponent } from '../../domain/components/DefaultComponents.ts';
    import { handleArrowNavigation, setupFocusListeners } from '../../utils/focusNavigation.ts';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';

    let { componentData, resolvedValue, updateComponentValue }: ScribeComponentProps<TextInputComponent> = $props();

    let inputValue = $derived(stringifyDataValue(resolvedValue));
    const config = $derived(componentData.config);

    let inputElement: HTMLInputElement | null = $state(null);

    const style = $derived.by(() => {
        let styleString = '';

        if (config?.expandWithContent) {
            styleString += 'field-sizing: content; max-width: calc(100% - 1rem);';
        }

        return styleString;
    });

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
        handleArrowNavigation(event, event.currentTarget);
    }

    $effect(() => {
        if (!inputElement) return;
        return setupFocusListeners(inputElement);
    });

    const oninput = (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        const val = event.currentTarget.value;

        if (val.trim() === '' || isNaN(Number(val))) {
            updateComponentValue({ type: 'string', value: val }, 'onchange');
        } else {
            updateComponentValue({ type: 'number', value: Number(val) }, 'onchange');
        }
    };

    const onblur = (event: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        const val = event.currentTarget.value;

        if (val.trim() === '' || isNaN(Number(val))) {
            updateComponentValue({ type: 'string', value: val }, 'onblur');
        } else {
            updateComponentValue({ type: 'number', value: Number(val) }, 'onblur');
        }
    };
</script>

<input 
    bind:this={inputElement}
    id={componentData.id} 
    data-scribe-focusable="true"
    onkeydown={handleKeyDown}
    autocomplete="off"
    {style} 
    placeholder={config?.placeholder} 
    class="scribe-text-input" 
    type="text"
    {oninput}
    {onblur}
    value={inputValue} 
/>

<style>
    .scribe-text-input {
        padding: 0 0.5em;
        background-color: var(--scribe-section-background);
        color: var(--scribe-doc-foreground);
        border: 1px solid var(--scribe-border-strong);
        border-radius: var(--scribe-radius-md);
        min-width: 2.5rem;
        /* As tall as a line of text, so a row with an input is not taller than a row without one */
        height: 1lh;
        margin: 0 0.5rem;
        outline: none;
        transition: border-color 150ms ease-out;
        box-sizing: border-box;
    }

    .scribe-text-input:hover {
        border-color: color-mix(in oklab, var(--scribe-doc-foreground) 38%, var(--scribe-section-background));
    }

    .scribe-text-input:focus {
        border-color: var(--scribe-accent);
        outline: 1px solid var(--scribe-accent);
    }
</style>
