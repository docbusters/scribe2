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
    const SMALL_STYLE = "width: 2rem; height: 2rem; min-width: 2rem; min-height: 2rem;";
    const LARGE_STYLE = "height: auto; width: auto; min-width: 3.5rem; padding: 0.375rem 0.625rem; flex-direction: column; gap: 0.25rem;";
</script>


<Button size="icon-sm" variant={isSelected ? "secondary" : "ghost"} title={name} {...buttonProps} style={label ? LARGE_STYLE : SMALL_STYLE}>
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
        width: 1.5rem;
        height: 1.5rem;
    }

    .large-label {
        font-size: var(--scribe-font-size-xs);
        font-weight: var(--scribe-font-weight-regular);
        line-height: 1;
    }
</style>
