<script lang="ts">
	import type { StringValue } from '../../domain/data/DataValue.js';
	import { defaultComponentOptions } from '../../registry/ComponentEditOptions.js';
	import { editStore } from '../../stores/edit-store.svelte.js';
	import { globalRegistry } from '../../stores/global-registry.svelte.js';
	import { selectionStore } from '../../stores/selection-store.svelte.js';
	import ComponentEditor from '../component/ComponentEditor.svelte';

	// When there is no component to act on the editor is rendered for a placeholder, so the toolbar keeps its layout.
	// The text component always exists, as custom registries extend the default one
	const PLACEHOLDER_VALUE: StringValue = { type: 'string', value: '' };

	// At an insertion point (an empty text slot) there is no component, so only adding a component makes sense
	const INSERTION_POINT_DISABLED_OPTIONS = ['duplicate', 'delete', 'setValue'];

	/** Describes the caret of the selected text, so components are added exactly there. It is null when no text holds the caret */
	const getInsertion = () => selectionStore.captureInsertion();

	/** What the editor shows options for, depending on what is selected */
	let target = $derived.by(() => {
		const selected = selectionStore.selected;

		if (selected?.kind === 'component') {
			const component = editStore.getComponent(selected.sectionId, selected.componentId);
			if (component) {
				return {
					componentType: component.type,
					componentValue: component.value,
					componentConfig: component.config,
					sectionId: selected.sectionId,
					componentId: component.id,
					options: globalRegistry.components[component.type]?.options ?? defaultComponentOptions,
					disabledOptions: selected.disabledOptions,
					getInsertion
				};
			}
		}

		if (selected?.kind === 'insertion') {
			return {
				componentType: 'text',
				componentValue: PLACEHOLDER_VALUE,
				sectionId: selected.sectionId,
				componentId: '',
				options: globalRegistry.getComponentOptions('text') ?? defaultComponentOptions,
				disabledOptions: INSERTION_POINT_DISABLED_OPTIONS,
				getInsertion
			};
		}

		return {
			componentType: 'text',
			componentValue: PLACEHOLDER_VALUE,
			sectionId: '',
			componentId: '',
			options: defaultComponentOptions,
			disabledOptions: [],
			disabled: true
		};
	});

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
	<ComponentEditor {...target} />
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
		background-color: var(--scribe-popover);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-xl);
		box-shadow: var(--scribe-shadow-md);
		user-select: none;
	}
</style>
