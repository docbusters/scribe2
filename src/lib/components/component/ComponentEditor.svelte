<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
	import { defaultComponentOptions, type ComponentEditOptions, type BaseComponentEditOptions } from "$lib/registry/ComponentEditOptions.js";
	import ComponentEditorButton from "./ComponentEditorButton.svelte";
    import { mount, unmount } from "svelte";
	import type { DataValue } from "$lib/domain/data/DataValue.js";
	import type { ComponentConfig } from "$lib/domain/components/Component.js";
	import { getI18n } from "$lib/i18n/i18n.svelte.js";
	import type { ToolbarInsertion } from "$lib/stores/toolbar-store.svelte.js";

    interface ComponentEditorProps extends HTMLAttributes<HTMLDivElement> {
        componentType: string;
        componentValue: DataValue;
        isBinding: boolean;
        componentConfig?: ComponentConfig;
        sectionId: string;
        componentId: string;
        disabled?: boolean;
        options?: ComponentEditOptions[];
        disabledOptions: string[];
        /**
         * 'floating' draws a compact row of icon buttons, used by the toolbar shown when hovering a component.
         * 'ribbon' draws the options in titled groups with large buttons, used by the top toolbar.
         */
        layout: 'floating' | 'ribbon';
        /** Called when an option is clicked. It describes where the caret is, so options that insert components can insert exactly there */
        getInsertion?: () => ToolbarInsertion | null;
    }

    let { componentType, isBinding, componentValue, componentConfig, sectionId, componentId, disabled = false, class: className, options = defaultComponentOptions, disabledOptions, layout, getInsertion, ...restProps }: ComponentEditorProps = $props();

	const i18n = getI18n();

	interface OptionTexts {
		name: string;
		label?: string;
		group?: string;
	}

	/** Returns the texts of an option. The default options are translated, the others provide their own texts */
	function getOptionTexts(opt: BaseComponentEditOptions): OptionTexts {
		const defaults: Record<string, OptionTexts> = {
			add: { name: i18n.t('toolbar.add'), label: i18n.t('toolbar.addLabel'), group: i18n.t('topToolbar.groups.component') },
			duplicate: { name: i18n.t('toolbar.duplicate'), label: i18n.t('toolbar.duplicateLabel'), group: i18n.t('topToolbar.groups.component') },
			delete: { name: i18n.t('toolbar.delete'), label: i18n.t('toolbar.deleteLabel'), group: i18n.t('topToolbar.groups.component') },
			setValue: { name: i18n.t('toolbar.setValue'), label: i18n.t('toolbar.setValueLabel'), group: i18n.t('topToolbar.groups.data') }
		};
		return defaults[opt.type] ?? { name: opt.name, label: opt.label, group: opt.group };
	}

	// Small buttons of the ribbon are larger than the ones of the floating toolbar
	const RIBBON_SMALL_BUTTON_STYLE = 'width: 2rem; height: 2rem; min-width: 2rem; min-height: 2rem;';

	// Ribbon groups with more buttons than this are laid out in two rows
	const RIBBON_MAX_SINGLE_ROW_BUTTONS = 3;

    let containerElement = $state<HTMLElement | null>(null);

	/** Mounts the button of an option (or its custom render) inside the target and returns its cleanup */
	function mountOption(option: BaseComponentEditOptions, target: HTMLElement, isRibbon: boolean): (() => void) | undefined {
		if (!option.props) return undefined;

		const texts = getOptionTexts(option);
		// Only the ribbon draws large buttons, so the label is not passed to the floating toolbar
		const label = isRibbon ? texts.label : undefined;
		const isOptionDisabled = disabled || disabledOptions.includes(option.type);
		const isSelected = option.isSelected ? option.isSelected({ value: componentValue, config: componentConfig }) : false;

		// If a custom render function is provided, use it to render the option
		if (option.render) {
			return option.render(target, {
				componentType,
				componentValue,
				sectionId,
				componentId,
				disabled: isOptionDisabled,
				name: texts.name,
				label,
				onclick: option.props.onclick,
				icon: option.props.icon,
				isBinding,
				isSelected
			}) ?? undefined;
		}

		// Otherwise, render a default button for the option
		const sizeProps = isRibbon && !label ? { size: 'icon' as const, style: RIBBON_SMALL_BUTTON_STYLE } : {};
		const app = mount(ComponentEditorButton, {
			target,
			props: {
				disabled: isOptionDisabled,
				name: texts.name,
				label,
				onclick: (e) => option.props!.onclick?.({ event: e, sectionId, componentId, insertion: getInsertion?.() ?? undefined }),
				icon: option.props.icon,
				isSelected,
				...sizeProps
			}
		});
		return () => unmount(app);
	}

    $effect(() => {
        if (!containerElement) return;

        const cleanups: (() => void)[] = [];

		if (layout === 'ribbon') {
			// Options are collected by group title, and the first appearance of a title decides the order of its group
			const groups: { title: string; options: BaseComponentEditOptions[] }[] = [];
			for (const option of options) {
				if (option.type === 'separator') continue;
				const baseOption = option as BaseComponentEditOptions;
				if (!baseOption.props) continue;

				const title = getOptionTexts(baseOption).group ?? i18n.t('topToolbar.groups.options');
				const group = groups.find(g => g.title === title);
				if (group) {
					group.options.push(baseOption);
				} else {
					groups.push({ title, options: [baseOption] });
				}
			}

			for (const group of groups) {
				const groupElement = document.createElement('div');
				groupElement.className = 'component-editor-group';

				const buttonsElement = document.createElement('div');
				buttonsElement.className = 'component-editor-group-buttons';
				const smallButtonsCount = group.options.filter(opt => !getOptionTexts(opt).label).length;
				buttonsElement.classList.toggle('is-grid', smallButtonsCount > RIBBON_MAX_SINGLE_ROW_BUTTONS);

				const titleElement = document.createElement('div');
				titleElement.className = 'component-editor-group-title';
				titleElement.textContent = group.title;

				groupElement.append(buttonsElement, titleElement);
				// The groups are plain containers for buttons mounted by framework-agnostic render functions, so they are created by hand
				// eslint-disable-next-line svelte/no-dom-manipulating
				containerElement.appendChild(groupElement);
				cleanups.push(() => groupElement.remove());

				for (const option of group.options) {
					const cleanup = mountOption(option, buttonsElement, true);
					if (cleanup) cleanups.push(cleanup);
				}
			}
		} else {
			options.forEach(option => {
				// Check if we need to render a separator
				if (option.type === 'separator') {
					const sep = document.createElement('div');
					sep.className = 'component-editor-separator';
					containerElement!.appendChild(sep);
					cleanups.push(() => sep.remove());
					return;
				}

				const cleanup = mountOption(option as BaseComponentEditOptions, containerElement!, false);
				if (cleanup) cleanups.push(cleanup);
			});
		}

        return () => {
            cleanups.forEach(c => c());
        };
    });
</script>

<div bind:this={containerElement} class={`component-editor-container ${layout === 'ribbon' ? 'is-ribbon' : ''} ${className || ''}`} {...restProps}>
</div>

<style>
    .component-editor-container {
        background-color: var(--scribe-popover);
        border-radius: var(--scribe-radius-lg);
        border: 1px solid var(--scribe-border-color);
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        padding: 0.25rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        align-items: center;
        justify-content: center;
    }

    :global(.component-editor-separator) {
        width: 1px;
        height: 1.25rem;
        background-color: var(--scribe-border-color);
        margin: 0 0.125rem;
    }

    /* Ribbon layout: flat, as the surface is the toolbar that contains it. Groups are separated by dividers and
       titled below their buttons */
    .component-editor-container.is-ribbon {
        background: none;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        gap: 0;
        align-items: stretch;
        justify-content: flex-start;
    }

    .component-editor-container.is-ribbon :global(.component-editor-group) {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0 0.75rem;
    }

    .component-editor-container.is-ribbon :global(.component-editor-group:first-child) {
        padding-left: 0;
    }

    .component-editor-container.is-ribbon :global(.component-editor-group:last-child) {
        padding-right: 0;
    }

    .component-editor-container.is-ribbon :global(.component-editor-group + .component-editor-group) {
        border-left: 1px solid var(--scribe-border-color);
    }

    .component-editor-container.is-ribbon :global(.component-editor-group-buttons) {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        gap: 0.125rem;
        min-height: 3.75rem;
    }

    /* Two rows of small buttons, filled column by column */
    .component-editor-container.is-ribbon :global(.component-editor-group-buttons.is-grid) {
        display: grid;
        grid-template-rows: repeat(2, 2rem);
        grid-auto-flow: column;
        align-content: center;
    }

    .component-editor-container.is-ribbon :global(.component-editor-group-title) {
        font-size: var(--scribe-font-size-xs);
        line-height: 1;
        color: var(--scribe-muted-foreground);
        white-space: nowrap;
		margin-top: 1rem;
    }
</style>
