<script lang="ts">
    import { Checkbox } from 'bits-ui';
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
    import type { CheckboxComponent } from '../../domain/components/DefaultComponents.ts';
    import { navigateToAdjacentComponent, setupFocusListeners } from '../../utils/focusNavigation.ts';
    import { i18n } from '$lib/i18n/i18n.svelte.js';

    let { componentData, resolvedValue, updateComponentValue }: ScribeComponentProps<CheckboxComponent> = $props();

    const checked = $derived(resolvedValue?.type === 'boolean' && resolvedValue.value);

    let element: HTMLButtonElement | null = $state(null);

    const ARROW_DIRECTIONS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' } as const;

    // A button has no caret, so every plain arrow moves to the neighbouring component
    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
        const direction = ARROW_DIRECTIONS[event.key as keyof typeof ARROW_DIRECTIONS];
        if (!direction || event.defaultPrevented || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
        if (navigateToAdjacentComponent(event.currentTarget, direction)) event.preventDefault();
    }

    $effect(() => {
        if (!element) return;
        return setupFocusListeners(element);
    });
</script>

<Checkbox.Root
    bind:ref={element}
    id={componentData.id}
    data-scribe-focusable="true"
    class="scribe-checkbox"
    aria-label={i18n.t('components.checkbox.name')}
    {checked}
    onCheckedChange={(value) => updateComponentValue({ type: 'boolean', value }, 'onblur')}
    onkeydown={handleKeyDown}
>
    {#if checked}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
    {/if}
</Checkbox.Root>

<style>
    /* Doubled class: the scoped reset of scribe.css sets padding and colour on buttons at (0,1,1) */
    :global(.scribe-checkbox.scribe-checkbox) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* As tall as a line of text, so a row with a checkbox is not taller than a row without one */
        height: 1lh;
        width: 1lh;
        padding: 0;
        margin: 0 0.25rem;
        vertical-align: top;
        box-sizing: border-box;
        cursor: pointer;
        background-color: var(--scribe-section-background);
        color: var(--scribe-primary-foreground);
        border: 1px solid var(--scribe-border-strong);
        border-radius: var(--scribe-radius-sm);
        transition: border-color 150ms ease-out, background-color 150ms ease-out;
    }

    :global(.scribe-checkbox.scribe-checkbox:hover) {
        border-color: color-mix(in oklab, var(--scribe-doc-foreground) 38%, var(--scribe-section-background));
    }

    :global(.scribe-checkbox.scribe-checkbox[data-state='checked']) {
        background-color: var(--scribe-primary);
        border-color: var(--scribe-primary);
    }

    :global(.scribe-checkbox svg) {
        width: 70%;
        height: 70%;
    }
</style>
