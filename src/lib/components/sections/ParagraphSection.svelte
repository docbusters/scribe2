<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { Section } from '../../domain/Section.js';
	import type { ScribeMode } from '../../types/ScribeProps.js';
	import ComponentFlow from '../content/ComponentFlow.svelte';
	import { setCaretPosition } from '../../utils/focusNavigation.ts';
	import { editStore } from '../../stores/edit-store.svelte.ts';

    interface ParagraphSectionProps {
        data: Section<DefaultComponents | C>;
        mode: ScribeMode;
        isDarkMode: boolean;
    }

    let { data, mode, isDarkMode }: ParagraphSectionProps = $props();

    let flowElement: HTMLElement | null = $state(null);

    let components = $derived(Object.values(data.content) as BaseComponent<string, DataValue>[]);

    // A section that has just been added gets the caret, so it can be written in right away
    $effect(() => {
        if (mode !== 'edit' || editStore.sectionToFocus !== data.id || !flowElement) return;

        const firstText = flowElement.querySelector<HTMLElement>('.edit-text[data-scribe-focusable="true"]');
        if (!firstText) return;

        firstText.focus();
        setCaretPosition(firstText, { direction: 'right' });
        editStore.sectionToFocus = null;
    });
</script>

<ComponentFlow {components} sectionId={data.id} {mode} {isDarkMode} slot={null} bind:container={flowElement} />
