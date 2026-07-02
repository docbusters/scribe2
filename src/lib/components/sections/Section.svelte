<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { Section } from '../../domain/Section.js';
	import ParagraphSection from './ParagraphSection.svelte';
	import GridSection from './GridSection.svelte';
	import type { ScribeMode } from '../../types/ScribeProps.js';
	import SectionEditor from './SectionEditor.svelte';
	import { fade } from 'svelte/transition';
	import { parseStringForContentEditable } from '../../utils/parseStringForContentEditable.js';
	import SectionTitle from '../utilComponents/SectionTitle.svelte';
	
    interface SectionProps {
        data: Section<DefaultComponents | C>;
        mode: ScribeMode;
        isNested?: boolean;
        isDarkMode: boolean;
    }

    let { data, mode, isNested = false, isDarkMode }: SectionProps = $props();

    let isEditMode = $derived(mode === 'edit' && !isNested);
    let sectionTitle = $derived(parseStringForContentEditable(data.title));
</script>

<section class={isEditMode ? 'section-edit' : ''} in:fade>
    {#if isEditMode}
        <div id="edit-handle" class="edit-handle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical-icon lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>

        <div class="section-editor">
            <SectionEditor sectionId={data.id} />
        </div>
    {/if}
    
    <div class="section-title-container">
        <SectionTitle {isEditMode} sectionId={data.id} text={sectionTitle} />
    </div>
    {#if data.type === 'paragraph-section'}
        <ParagraphSection {data} {mode} {isDarkMode} />
    {:else if data.type === 'grid-section'}
        <GridSection {data} {mode} {isDarkMode} />
    {/if}
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
        border-radius: var(--scribe-section-radius);
        padding: 0.75rem 1.25rem;
        margin: 0 0.5rem;
    }

    .section-title-container {
        display: inline;
    }

    .section-edit {
        padding-left: 1.75rem;
        margin-right: 3.25rem;
    }

    :hover.section-edit .edit-handle, :hover.section-edit .section-editor {
        opacity: 1;
    }

    .edit-handle {
        opacity: 0;
        position: absolute;
        left: 0.1rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: grab;
        border-radius: var(--scribe-radius-sm);
        padding: 0.1rem;
        transition: opacity 0.5s ease;
    }

    .section-editor {
        position: absolute;
        bottom: 0;
        transform: translateY(0%) translateX(90%);
        right: 0;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.5s ease;
        padding: 0.25rem 1rem;
        border-radius: 1rem;
    }
</style>

