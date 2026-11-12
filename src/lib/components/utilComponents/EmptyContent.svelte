<svelte:options
    customElement={{
        tag: 'scribe-empty-content',
        shadow: 'none',
        props: {
            message: { type: 'String' },
            description: { type: 'String' },
            icon: { type: 'String' },
            isError: { type: 'Boolean' },
            valueStyle: { type: 'String' },
            style: { type: 'String' },
            action: { type: 'Object' }
        }
    }}
/>

<script lang="ts">
	import type { EmptyContentProps } from "$lib/types/EmptyContentProps.js";
	import Button from "./Button.svelte";
	import type { Snippet } from "svelte";

    /* eslint-disable svelte/no-at-html-tags */
    // `children` is for Svelte use only (it goes between the description and the action): it is not a prop of <scribe-empty-content>
    let { message, description, icon, isError = false, valueStyle, style, action, children }: EmptyContentProps & { children?: Snippet } = $props();

</script>

<div class="empty-container" class:has-action={!!action} class:is-error={isError} style={style}>
    {#if icon}
        <div class="scribe-tile icon">
            {@html icon}
        </div>
    {/if}
    <span class="message">
        {message}
    </span>
    {#if description}
        <span style={valueStyle} class="value">
            {description}
        </span>
    {/if}
    {@render children?.()}
    {#if action}
        <div class="action">
            <Button size="sm" variant="outline" onclick={() => action.onclick()}>{action.label}</Button>
        </div>
    {/if}
</div>

<style>
    :host {
        display: block;
        width: 100%;
    }
    .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* Centred vertically when the card is taller than its content (a block with a height). `safe` keeps the top visible when it is shorter */
        justify-content: center;
        justify-content: safe center;
        gap: 0.5rem;
        padding: 1rem;
        text-align: center;
        border: 1px dashed var(--scribe-border-strong);
        border-radius: var(--scribe-radius-xl);
        background-color: var(--scribe-muted);
        flex: 1;
    }

    .empty-container.is-error {
        border-color: var(--scribe-error-soft);
        background-color: var(--scribe-error-wash);
    }

    /* The button needs room around it; a style given by the component still wins as it is inline */
    .empty-container.has-action {
        padding-block: 1.5rem;
    }

    /* On top of the gap of the card, so the button is clearly set apart from the message */
    .action {
        margin-top: 0.5rem;
    }

    .icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--scribe-radius-lg);
        background-color: var(--scribe-section-background);
    }

    .is-error .icon {
        --tile: var(--scribe-error-foreground);
    }

    /* Icons come from the caller as 24px markup; the tile rule would shrink them */
    .icon :global(svg) {
        width: 1.25rem;
        height: 1.25rem;
    }

    .message {
        color: var(--scribe-doc-foreground);
        font-weight: var(--scribe-font-weight-semibold);
        font-size: var(--scribe-font-size-sm);
        line-height: 1.35;
    }

    .is-error .message {
        color: var(--scribe-error-foreground);
    }

    .value {
        padding: 0.125rem 0.5rem;
        border-radius: var(--scribe-radius-md);
        font-size: var(--scribe-font-size-xs);
        color: var(--scribe-muted-foreground);
    }
</style>
