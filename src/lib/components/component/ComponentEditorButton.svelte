<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import Button, { type ButtonProps } from "../utilComponents/Button.svelte";

    interface ComponentEditorButtonProps extends ButtonProps {
        icon?: string;
        name: string;
        /** Short text. When present the button is drawn large, with the icon over the text */
        label?: string;
        disabled?: boolean;
        isSelected: boolean;
    }

    let { name, icon, label, isSelected, style = "", ...buttonProps }: ComponentEditorButtonProps = $props();

    // Overrides the fixed size of the icon-sm button, as the large button grows with its text
    const LARGE_STYLE = "height: auto; width: auto; min-width: 3.5rem; padding: 0.375rem 0.625rem; flex-direction: column; gap: 0.25rem;";
</script>


<Button size="icon-sm" variant={isSelected ? "secondary" : "ghost"} title={name} {...buttonProps} style={label ? `${LARGE_STYLE} ${style}` : style}>
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
        font-weight: var(--scribe-font-weight-medium);
        line-height: 1;
    }
</style>
