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
            style: { type: 'String' }
        }
    }}
/>

<script lang="ts">
	import type { EmptyContentProps } from "$lib/types/EmptyContentProps.js";

    /* eslint-disable svelte/no-at-html-tags */
    let { message, description, icon, isError = false, valueStyle, style }: EmptyContentProps = $props();

</script>

<div class="empty-container" style={style}>
    {#if icon}
        <div class={`icon ${isError ? 'icon-error' : ''}`}>
            {@html icon}
        </div>
    {/if}
    <span class={"message" + (isError ? " message-error" : "")}>
        {message}
    </span>
    {#if description}
        <span style={valueStyle} class="value">
            {description}
        </span>
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
        gap: 0.5rem;
        padding: 1rem;
        text-align: center;
        border: 1px dashed var(--scribe-border-color);
        border-radius: var(--scribe-radius-2xl);
        background-color: var(--scribe-section-background);
        flex: 1;
    }

    .icon {
        color: var(--scribe-secondary-foreground);
        background-color: var(--scribe-secondary);
        padding: 0.5rem;
        border-radius: var(--scribe-radius-xl);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon-error {
        background-color: oklch(from var(--scribe-error-foreground) l c h / 15%);
        color: var(--scribe-error-foreground);
    }

    .message {
        color: var(--scribe-doc-foreground);
        font-weight: var(--scribe-font-weight-semibold);
        font-size: var(--scribe-font-size-sm);
    }

    .message-error {
        color: var(--scribe-error-foreground);
    }

    .value {
        padding: 0.25rem 0.5rem;
        border-radius: var(--scribe-radius-xl);
        font-size: var(--scribe-font-size-xs);
    }
</style>
