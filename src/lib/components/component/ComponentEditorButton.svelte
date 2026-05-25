<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import { type ComponentEditProps } from "$lib/registry/ComponentEditOptions.js";
	import Button from "../utilComponents/Button.svelte";


    let { sectionId, componentId, disabled, name, onClick, icon }: ComponentEditProps = $props();
</script>


<Button {disabled} size="icon-sm" variant="ghost" title={name} onclick={(event) => onClick?.({ event, sectionId, componentId })}>
    {#if icon}
        {@html icon}
    {/if}
</Button>
