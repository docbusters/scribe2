<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import Button, { type ButtonProps } from "../utilComponents/Button.svelte";

    interface ComponentEditorButtonProps extends Omit<ButtonProps, 'size' | 'variant' | 'style'> {
        icon?: string;
        name: string;
        /** Short text. When present the button is drawn large, with the icon over the text */
        label?: string;
        disabled?: boolean;
        isSelected: boolean;
    }

    let { name, icon, label, isSelected, ...buttonProps }: ComponentEditorButtonProps = $props();

    // Buttons without a label are square icons, the ones with a label grow with their text
    // The size comes from a variable so a grid of buttons can make them smaller (an inline style cannot be overridden by CSS)
    const SMALL_STYLE = "width: var(--editor-icon-button-size, 2rem); height: var(--editor-icon-button-size, 2rem); min-width: var(--editor-icon-button-size, 2rem); min-height: var(--editor-icon-button-size, 2rem);";
    const LARGE_STYLE = "height: auto; width: auto; min-width: 4rem; min-height: 3.5rem; padding: 0.375rem 0.625rem; flex-direction: column; gap: 0.25rem;";
</script>


<Button size="icon-sm" variant={isSelected ? "soft" : "ghost"} title={name} aria-label={label ? undefined : name} aria-pressed={isSelected || undefined} {...buttonProps} style={label ? LARGE_STYLE : SMALL_STYLE}>
    {#if label}
        <span class="large-icon">
            {#if icon}
                {@html icon}
            {/if}
        </span>
        <span class="large-label">{label}</span>
    {:else if icon}
        {@html icon}
    {/if}
</Button>

<style>
    .large-icon {
        display: flex;
    }

    .large-icon :global(svg) {
        width: 1.25rem;
        height: 1.25rem;
    }

    .large-label {
        font-size: var(--scribe-font-size-xs);
        font-weight: var(--scribe-font-weight-medium);
        line-height: 1;
    }
</style>
