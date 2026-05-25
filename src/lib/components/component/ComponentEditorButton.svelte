<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import Button, { type ButtonProps } from "../utilComponents/Button.svelte";

    interface ComponentEditorButtonProps extends ButtonProps {
        icon?: string;
        name: string;
        disabled?: boolean;
    }

    let { name, icon, ...buttonProps }: ComponentEditorButtonProps = $props();
</script>


<Button size="icon-sm" variant="ghost" title={name} {...buttonProps}>
    {#if icon}
        {@html icon}
    {/if}
</Button>
