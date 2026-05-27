<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import Button, { type ButtonProps } from "../utilComponents/Button.svelte";

    interface ComponentEditorButtonProps extends ButtonProps {
        icon?: string;
        name: string;
        disabled?: boolean;
        isSelected: boolean;
    }

    let { name, icon, isSelected, ...buttonProps }: ComponentEditorButtonProps = $props();
</script>


<Button size="icon-sm" variant={isSelected ? "secondary" : "ghost"} title={name} {...buttonProps}>
    {#if icon}
        {@html icon}
    {/if}
</Button>
