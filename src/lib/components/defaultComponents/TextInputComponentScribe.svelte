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
        padding: 0em 0.5em;
        border: 1px solid color-mix(in srgb, var(--scribe-border-color) 50%, transparent);
        border-radius: var(--scribe-radius-md, 0.5em);
        min-width: 2.5rem;
        margin: 0 0.5rem;
        outline: none;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    .scribe-text-input:hover {
        border-color: color-mix(in srgb, var(--scribe-border-color) 40%, var(--scribe-primary));
    }

    .scribe-text-input:focus {
        outline: none;
        border-color: var(--scribe-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--scribe-primary) 15%, transparent);
    }
</style>
