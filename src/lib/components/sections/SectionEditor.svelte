<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import Button from "../utilComponents/Button.svelte";
	import { editStore } from "$lib/stores/edit-store.svelte.js";

	
    interface SectionEditorProps extends HTMLAttributes<HTMLDivElement> {
        sectionId: string;
        disabled?: boolean;
    }

    let { sectionId, disabled = false, ...restProps }: SectionEditorProps = $props();

    function handleAdd() {
        editStore.addSectionBelow(sectionId);
    }

    function handleDuplicate() {
        editStore.duplicateSection(sectionId);
    }

    function handleDelete() {
        editStore.deleteSection(sectionId);
    }

</script>

<div class={`section-editor-container ${restProps.class || ''}`} {...restProps}>
    <Button {disabled} size="icon-sm" variant="ghost" title="Add section below" onclick={handleAdd}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    </Button>
    <Button {disabled} size="icon-sm" variant="ghost" title="Duplicate section" onclick={handleDuplicate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-popover-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>    </Button>
    <Button {disabled} size="icon-sm" variant="ghost" title="Delete section" onclick={handleDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--scribe-error-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </Button>
</div>

<style>
    .section-editor-container {
        background-color: var(--scribe-popover);
        border-radius: var(--scribe-radius-lg);
        border: 1px solid var(--scribe-border-color);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.25rem;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
        width: fit-content;
    }
</style>

