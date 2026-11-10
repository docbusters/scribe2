<script lang="ts">
	import type { StringValue } from '../../domain/data/DataValue.js';
	import { editStore } from '../../stores/edit-store.svelte.js';
	import { globalRegistry } from '../../stores/global-registry.svelte.js';
	import { selectionStore } from '../../stores/selection-store.svelte.js';
	import ComponentEditor from '../component/ComponentEditor.svelte';

	// When there is no component to act on the editor is rendered for a placeholder, so the default buttons show up
	// and the toolbar keeps its layout. The text component always exists, as custom registries extend the default one
	const PLACEHOLDER_VALUE: StringValue = { type: 'string', value: '' };

	// At an insertion point (an empty text slot) there is no component, so only adding a component makes sense
	const INSERTION_POINT_DISABLED_OPTIONS = ['duplicate', 'delete', 'setValue'];

	let selected = $derived(selectionStore.selected);
	let component = $derived(selected?.kind === 'component' ? editStore.getComponent(selected.sectionId, selected.componentId) : null);

	/** Describes the caret of the selected text, so components are added exactly there. It is null when no text holds the caret */
	function getInsertion() {
		return selectionStore.captureInsertion();
	}

	/**
	 * Pressing a button must not take the focus from the text, otherwise the text would lose its caret (and save
	 * its content) before the button is handled. The buttons still receive their click
	 */
	function keepTextFocus(event: MouseEvent) {
		event.preventDefault();
	}
</script>

<!-- The scribe-top-toolbar class keeps the selection when the toolbar is clicked, see Scribe.svelte -->
<div class="scribe-top-toolbar" role="toolbar" aria-label="Component toolbar" tabindex="-1" onmousedown={keepTextFocus}>
	{#if selected?.kind === 'component' && component}
		<ComponentEditor
			layout="ribbon"
			componentType={component.type}
			componentValue={component.value}
			componentConfig={component.config}
			isBinding={component.value.type === 'binding'}
			sectionId={selected.sectionId}
			componentId={component.id}
			options={globalRegistry.getComponentOptions(component.type)}
			disabledOptions={selected.disabledOptions}
			getInsertion={getInsertion}
		/>
	{:else if selected?.kind === 'insertion'}
		<ComponentEditor
			layout="ribbon"
			componentType="text"
			componentValue={PLACEHOLDER_VALUE}
			isBinding={false}
			sectionId={selected.sectionId}
			componentId=""
			options={globalRegistry.getComponentOptions('text')}
			getInsertion={getInsertion}
			disabledOptions={INSERTION_POINT_DISABLED_OPTIONS}
		/>
	{:else}
		<ComponentEditor
			layout="ribbon"
			componentType="text"
			componentValue={PLACEHOLDER_VALUE}
			isBinding={false}
			sectionId=""
			componentId=""
			disabled={true}
			disabledOptions={[]}
		/>
	{/if}
</div>

<style>
	.scribe-top-toolbar {
		position: sticky;
		top: 0.5rem;
		z-index: 3;
		display: flex;
		align-items: stretch;
		width: 100%;
		padding: 0.5rem 0.75rem;
		overflow-x: auto;
		background-color: color-mix(in srgb, var(--scribe-popover) 85%, transparent);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-xl);
		box-shadow: var(--scribe-shadow-md);
		user-select: none;
	}
</style>
