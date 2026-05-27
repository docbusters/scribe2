<script lang="ts">
	import Button from "./Button.svelte";
	import { textFormatToolbarStore, type TextFormatCommand } from "../../stores/text-format-toolbar-store.svelte.js";

	let toolbarRef: HTMLDivElement | null = $state(null);

    let activeFormats = $derived(textFormatToolbarStore.activeFormats);

	function handleOutsideClick(event: PointerEvent) {
		if (textFormatToolbarStore.isOpen && toolbarRef) {
			const path = event.composedPath();
			if (!path.includes(toolbarRef)) {
				textFormatToolbarStore.close();
			}
		}
	}

    function applyFormat(command: TextFormatCommand) {
        textFormatToolbarStore.applyFormat(command);
    }
</script>

<svelte:window onpointerdown={handleOutsideClick} />

<div bind:this={toolbarRef} class:text-toolbar-visible={textFormatToolbarStore.isOpen} class="text-toolbar-container" style="top: {textFormatToolbarStore.position.y}px; left: {textFormatToolbarStore.position.x}px;">
    <Button size="icon-sm" variant={activeFormats.bold ? "secondary" : "ghost"} title="Bold" onclick={() => applyFormat('bold')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>
    </Button>
    <Button size="icon-sm" variant={activeFormats.italic ? "secondary" : "ghost"} title="Italic" onclick={() => applyFormat('italic')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
    </Button>
    <Button size="icon-sm" variant={activeFormats.underline ? "secondary" : "ghost"} title="Underline" onclick={() => applyFormat('underline')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
    </Button>
    <Button size="icon-sm" variant={activeFormats.strikethrough ? "secondary" : "ghost"} title="Strikethrough" onclick={() => applyFormat('strikethrough')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
    </Button>
</div>

<style>
    .text-toolbar-container {
        position: absolute;
        background-color: var(--scribe-popover);
        color: var(--scribe-popover-foreground);
        border-radius: var(--scribe-radius-lg);
        border: 1px solid var(--scribe-border-color);
        transform: translateY(-120%) translateX(0%);
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        padding: 0.25rem;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
        opacity: 0;
        transition: opacity 200ms ease-in-out;
        user-select: none;
        z-index: 2;
    }

    .text-toolbar-visible {
        opacity: 1;
        user-select: auto;
    }
</style>

