<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { Section } from '../../domain/Section.js';
	import ParagraphSection from './ParagraphSection.svelte';
	import type { ScribeMode } from '../../types/ScribeProps.js';
	import SectionEditor from './SectionEditor.svelte';
	import { fade } from 'svelte/transition';
	import { parseStringForContentEditable } from '../../utils/parseStringForContentEditable.js';
	import SectionTitle from '../utilComponents/SectionTitle.svelte';
	
    interface SectionProps {
        data: Section<DefaultComponents | C>;
        mode: ScribeMode;
        isDarkMode: boolean;
    }

    let { data, mode, isDarkMode }: SectionProps = $props();

    let isEditMode = $derived(mode === 'edit');
    let sectionTitle = $derived(parseStringForContentEditable(data.title));
</script>

<section class={isEditMode ? 'section-edit' : ''} in:fade>
    {#if isEditMode}
        <div class="edit-handle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>

        <div class="section-editor">
            <SectionEditor sectionId={data.id} />
        </div>
    {/if}
    
    <div class="section-title-container">
        <SectionTitle {isEditMode} sectionId={data.id} text={sectionTitle} />
    </div>
    <ParagraphSection {data} {mode} {isDarkMode} />
</section>

<style>
    section {
        position: relative;
        flex: 1;
        gap: var(--scribe-section-heading-gap);
        display: flex;
        flex-direction: column;
        background-color: var(--scribe-section-background);
        color: var(--scribe-section-foreground);
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-section-radius);
        box-shadow: var(--scribe-shadow-sm);
        padding: 1.25rem 1.5rem;
        margin: 0 0.5rem;
    }

    .section-title-container {
        display: inline;
    }

    .section-edit {
        padding-left: 2rem;
        margin-right: 3.25rem;
    }

    /* The handle and the section toolbar show on hover, and when the keyboard reaches them */
    .section-edit:hover .edit-handle,
    .section-edit:hover .section-editor,
    .section-edit:focus-within .edit-handle,
    .section-edit:focus-within .section-editor {
        opacity: 1;
    }

    .edit-handle {
        opacity: 0;
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        cursor: grab;
        color: var(--scribe-muted-foreground);
        border-radius: var(--scribe-radius-sm);
        padding: 0.125rem;
        transition: opacity 150ms ease-out;
    }

    .edit-handle:hover {
        color: var(--scribe-doc-foreground);
        background-color: var(--scribe-muted);
    }

    .section-editor {
        position: absolute;
        bottom: 0;
        transform: translateX(90%);
        right: 0;
        z-index: 10;
        opacity: 0;
        transition: opacity 150ms ease-out;
        padding: 0.25rem 1rem;
    }
</style>
