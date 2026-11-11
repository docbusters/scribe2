<script lang="ts">
	import type { ComponentEditOptions, ComponentEditProps, ComponentEditOptionContext } from "$lib/registry/ComponentEditOptions.js";
	import ComponentEditorButton from "./ComponentEditorButton.svelte";
	import type { DataValue } from "$lib/domain/data/DataValue.js";
	import type { ComponentConfig } from "$lib/domain/components/Component.js";
	import { getI18n } from "$lib/i18n/i18n.svelte.js";
	import type { ToolbarInsertion } from "$lib/stores/toolbar-store.svelte.js";
	import { fly } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { isMacPlatform, matchesShortcut, parseShortcut } from "$lib/utils/shortcuts.js";
	import { cubicOut } from "svelte/easing";

    interface ComponentEditorProps {
        componentType: string;
        componentValue: DataValue;
        componentConfig?: ComponentConfig;
        sectionId: string;
        componentId: string;
        options: ComponentEditOptions[];
        /** Types of the options that cannot be used for this component */
        disabledOptions: string[];
        /** Disables every option, for when there is nothing to act on */
        disabled?: boolean;
        /** Called when an option is clicked. It describes where the caret is, so options that insert components can insert exactly there */
        getInsertion?: () => ToolbarInsertion | null;
    }

    let { componentType, componentValue, componentConfig, sectionId, componentId, options, disabledOptions, disabled = false, getInsertion }: ComponentEditorProps = $props();

	const i18n = getI18n();

	interface OptionButton {
		option: ComponentEditOptions;
		name: string;
		label?: string;
	}

	interface OptionGroup {
		title: string;
		buttons: OptionButton[];
	}

	/** Returns the texts of an option. The default options are translated, the others provide their own texts */
	function getOptionTexts(opt: ComponentEditOptions) {
		const defaults: Record<string, { name: string; label?: string; group?: string }> = {
			add: { name: i18n.t('toolbar.add'), label: i18n.t('toolbar.addLabel'), group: i18n.t('topToolbar.groups.component') },
			duplicate: { name: i18n.t('toolbar.duplicate'), label: i18n.t('toolbar.duplicateLabel'), group: i18n.t('topToolbar.groups.component') },
			delete: { name: i18n.t('toolbar.delete'), label: i18n.t('toolbar.deleteLabel'), group: i18n.t('topToolbar.groups.component') },
			setValue: { name: i18n.t('toolbar.setValue'), label: i18n.t('toolbar.setValueLabel'), group: i18n.t('topToolbar.groups.data') }
		};
		return defaults[opt.type] ?? { name: opt.name, label: opt.label, group: opt.group };
	}

	// Options are collected by group title, and the first appearance of a title decides the order of its group
	let groups = $derived.by(() => {
		const result: OptionGroup[] = [];
		for (const option of options) {
			const { name, label, group } = getOptionTexts(option);
			const title = group ?? i18n.t('topToolbar.groups.options');
			const button = { option, name, label };

			const existing = result.find(g => g.title === title);
			if (existing) {
				existing.buttons.push(button);
			} else {
				result.push({ title, buttons: [button] });
			}
		}
		return result;
	});

	// Groups with more icon buttons than this are laid out in two rows
	const MAX_SINGLE_ROW_BUTTONS = 3;

	function isGrid(group: OptionGroup): boolean {
		return group.buttons.filter(button => !button.label).length > MAX_SINGLE_ROW_BUTTONS;
	}

	const isMac = isMacPlatform();

	// The options that have a valid shortcut. Invalid ones are reported when the registry is initialized
	let shortcutOptions = $derived(options.flatMap(option => {
		const parsed = option.shortcut ? parseShortcut(option.shortcut) : null;
		return parsed ? [{ option, parsed }] : [];
	}));

	let editorElement: HTMLElement | undefined = $state();

	/**
	 * Whether typing happens in the target. A shortcut without Ctrl, Mod or Alt must leave its key to the field. Alt ones run: they type
	 * nothing on Windows and Linux (and the text input can only be selected by focusing it), and on a Mac they win over the Option character
	 */
	const isTypingTarget = (target: HTMLElement) => target.isContentEditable || target.matches('input, textarea, select');

	/**
	 * Runs the option whose shortcut is pressed by clicking its button, so the shortcut behaves exactly as the mouse: it respects the
	 * disabled state and the options read the caret and the position of the button as usual
	 */
	function handleShortcut(event: KeyboardEvent) {
		// A component that handles the key itself (the text does with Ctrl+Space) calls preventDefault, and wins
		if (disabled || event.defaultPrevented || event.isComposing || event.repeat || !editorElement) return;

		const target = event.target instanceof HTMLElement ? event.target : null;
		// Only the document and the page body count. Dialogs and menus have their own keys
		if (!target || target.closest('[role="dialog"], [role="menu"], [role="listbox"]')) return;
		if (target !== document.body && !target.closest('.scribe-document')) return;

		const match = shortcutOptions.find(({ parsed }) => matchesShortcut(event, parsed, isMac));
		if (!match) return;
		if (!match.parsed.mod && !match.parsed.ctrl && !match.parsed.alt && isTypingTarget(target)) return;

		// Prevented even when the option is disabled, so the browser does not do its own action (Ctrl+B or Ctrl+D)
		event.preventDefault();
		const element = editorElement.querySelector(`[data-option-type="${CSS.escape(match.option.type)}"]`);
		const button = element instanceof HTMLButtonElement ? element : element?.querySelector('button');
		if (button && !button.disabled) button.click();
	}

	const getContext = (): ComponentEditOptionContext => ({ sectionId, componentId, value: componentValue, config: componentConfig });
	const isOptionDisabled = (option: ComponentEditOptions) => disabled || disabledOptions.includes(option.type) || (option.isDisabled?.(getContext()) ?? false);
	const isOptionSelected = (option: ComponentEditOptions) => option.isSelected?.(getContext()) ?? false;

	/**
	 * Lets an option render itself with a framework-agnostic render function. The data it receives has getters, so the option
	 * follows the component without being rendered again
	 */
	function renderOption(node: HTMLElement, { option, name, label }: OptionButton) {
		const cleanup = option.render?.(node, {
			get componentType() { return componentType; },
			get componentValue() { return componentValue; },
			get sectionId() { return sectionId; },
			get componentId() { return componentId; },
			get isBinding() { return componentValue.type === 'binding'; },
			get disabled() { return isOptionDisabled(option); },
			get isSelected() { return isOptionSelected(option); },
			shortcut: option.shortcut,
			name,
			label,
			onclick: option.props.onclick,
			icon: option.props.icon
		} satisfies ComponentEditProps);

		return { destroy: () => cleanup?.() };
	}
</script>

<svelte:document onkeydown={handleShortcut} />

<div class="component-editor" bind:this={editorElement}>
	{#each groups as group (group.title)}
		<!-- ComponentEditOptions.ts finds this element by its class to open the add dropdown below the whole group -->
		<div class="component-editor-group" in:fly={{ y: 6, duration: 220, delay: 80, easing: cubicOut }} animate:flip={{ duration: 220, easing: cubicOut }}>
			<div class="group-buttons" class:is-grid={isGrid(group)}>
				{#each group.buttons as button (button.option)}
					{#if button.option.render}
						<!-- data-option-type lets the shortcuts find the button, which the option draws -->
						<div style="display: contents;" data-option-type={button.option.type} use:renderOption={button}></div>
					{:else}
						<ComponentEditorButton
							data-option-type={button.option.type}
							shortcut={button.option.shortcut}
							name={button.name}
							label={button.label}
							icon={button.option.props.icon}
							disabled={isOptionDisabled(button.option)}
							isSelected={isOptionSelected(button.option)}
							onclick={(event) => button.option.props.onclick?.({
								event,
								sectionId,
								componentId,
								// Read only by the options that need the caret. Capturing it can save a new text, which a format button must not do
								get insertion() { return getInsertion?.() ?? undefined; }
							})}
						/>
					{/if}
				{/each}
			</div>
			<div class="group-title scribe-caps-label">{group.title}</div>
		</div>
	{/each}
</div>

<style>
    /* Flat, as the surface is the toolbar that contains it. Groups are separated by dividers and titled below their buttons */
    .component-editor {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;
    }

    .component-editor-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
        padding: 0 0.75rem;
    }

    .component-editor-group:first-child {
        padding-left: 0;
    }

    .component-editor-group:last-child {
        padding-right: 0;
    }

    .component-editor-group + .component-editor-group {
        border-left: 1px solid var(--scribe-border-color);
    }

    .group-buttons {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        gap: 0.125rem;
        height: 3.5rem;
    }

    /* Two rows of small buttons, filled column by column. They shrink so the grid fits the height of the large buttons */
    .group-buttons.is-grid {
        --editor-icon-button-size: 1.6875rem;
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        grid-auto-flow: column;
        align-content: center;
    }

    .group-title {
        white-space: nowrap;
    }
</style>
