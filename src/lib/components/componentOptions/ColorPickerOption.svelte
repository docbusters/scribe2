<script lang="ts">
    import { Popover } from 'bits-ui';
    import type { ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
    import { editStore } from '$lib/stores/edit-store.svelte.js';
    import ComponentEditorButton from '$lib/components/component/ComponentEditorButton.svelte';
    import Button from '$lib/components/utilComponents/Button.svelte';
    import Divider from '$lib/components/utilComponents/Divider.svelte';
    import { COLOR_PALETTE_MAIN, COLOR_PALETTE_SHADES, isHexColor, isLightColor, type PaletteColor } from '$lib/utils/colorPalette.js';
    import { getI18n } from '$lib/i18n/i18n.svelte.js';

    interface ColorPickerOptionProps extends ComponentEditProps {
        /** Key of the component config that stores the colour (`#rrggbb`) */
        configKey: string;
        /** Colour drawn when the config has none (`#rrggbb`) */
        defaultColor: string;
    }

    let { name, label, sectionId, componentId, disabled, shortcut, configKey, defaultColor }: ColorPickerOptionProps = $props();

    const i18n = getI18n();

    const ROWS: PaletteColor[][] = [COLOR_PALETTE_MAIN, ...COLOR_PALETTE_SHADES];
    const allColors = ROWS.flat();

    let open = $state(false);
    let root: HTMLElement | undefined = $state();
    let grid: HTMLElement | undefined = $state();
    let nativeInput: HTMLInputElement | undefined = $state();

    // The colour is read from the document (checked, as it can come from anywhere) so the swatch follows undo, bindings and other editors
    const config = $derived(editStore.getComponentConfig(sectionId, componentId) ?? undefined);
    const stored = $derived(config?.[configKey]);
    const current = $derived(isHexColor(stored) ? stored.toLowerCase() : defaultColor);

    // The popover goes inside the Scribe element, so it gets the theme and the tokens, and a click in it keeps the selection. An option that
    // mounts itself has no Svelte context to ask for that element, so it is found from the button
    const portalTarget = $derived(root?.closest('.scribe-document')?.querySelector<HTMLElement>('.scribe-portal-target') ?? undefined);

    // A rounded block of the colour, with a hairline so white shows on the ribbon. `current` is a checked hex, so it is safe in markup
    const icon = $derived(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><rect x="0.5" y="0.5" width="27" height="19" rx="5" fill="${current}" style="stroke: var(--scribe-border-strong)"/></svg>`);

    // Only one swatch is in the tab order (roving tabindex): the one last focused, or else the current colour
    let focused = $state('');
    const tabStop = $derived(allColors.some(c => c.hex === focused) ? focused : allColors.some(c => c.hex === current) ? current : allColors[0].hex);

    function select(hex: string) {
        const next = { ...editStore.getComponentConfig(sectionId, componentId), [configKey]: hex };
        editStore.setComponentConfig(sectionId, componentId, next);
        open = false;
    }

    /** Opens the native picker for any other colour. The popover closes first, as the input lives next to the button and not inside it */
    function openNativePicker() {
        open = false;
        nativeInput?.showPicker();
    }

    function handleOpenChange(value: boolean) {
        if (value) focused = '';
    }

    /** Arrow keys move over the grid (up and down keep the column), Home and End go to the ends of the row */
    function handleGridKeydown(event: KeyboardEvent) {
        const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-row]') : null;
        if (!target || !grid) return;

        let row = Number(target.dataset.row);
        let col = Number(target.dataset.col);
        const lastRow = ROWS.length - 1;
        const lastCol = ROWS[row].length - 1;

        switch (event.key) {
            case 'ArrowRight': col = Math.min(col + 1, lastCol); break;
            case 'ArrowLeft': col = Math.max(col - 1, 0); break;
            case 'ArrowDown': row = Math.min(row + 1, lastRow); break;
            case 'ArrowUp': row = Math.max(row - 1, 0); break;
            case 'Home': col = 0; break;
            case 'End': col = lastCol; break;
            default: return;
        }

        event.preventDefault();
        grid.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)?.focus();
    }
</script>

<span class="color-option" bind:this={root}>
    <Popover.Root bind:open onOpenChange={handleOpenChange}>
        <Popover.Trigger>
            {#snippet child({ props })}
                <ComponentEditorButton {...props} class="color-trigger" {icon} {name} {label} {disabled} {shortcut} isSelected={false} />
            {/snippet}
        </Popover.Trigger>
        <Popover.Portal to={portalTarget}>
            <Popover.Content class="scribe-color-popover" side="bottom" align="start" sideOffset={6} collisionPadding={8}>
                <p class="color-title">{i18n.t('colorPicker.title')}</p>

                <!-- The keys come from the swatch buttons inside, which are the focusable elements -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <div class="color-grid" bind:this={grid} role="group" aria-label={i18n.t('colorPicker.title')} onkeydown={handleGridKeydown}>
                    {#each ROWS as row, rowIndex (rowIndex)}
                        {#if rowIndex === 1}
                            <Divider />
                        {/if}
                        <div class="color-row">
                            {#each row as color, colIndex (color.hex)}
                                {@const colorName = i18n.t(`colorPicker.names.${color.name}`)}
                                <button
                                    type="button"
                                    class="color-swatch"
                                    class:is-light={isLightColor(color.hex)}
                                    style="background-color: {color.hex};"
                                    data-row={rowIndex}
                                    data-col={colIndex}
                                    tabindex={color.hex === tabStop ? 0 : -1}
                                    title={i18n.t('colorPicker.swatch', { name: colorName, hex: color.hex })}
                                    aria-label={i18n.t('colorPicker.swatch', { name: colorName, hex: color.hex })}
                                    aria-pressed={color.hex === current}
                                    onfocus={() => (focused = color.hex)}
                                    onclick={() => select(color.hex)}
                                >
                                    {#if color.hex === current}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    {/each}
                </div>

                <Divider />

                <Button variant="ghost" size="sm" class="color-more" onclick={openNativePicker}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    {i18n.t('colorPicker.more')}
                </Button>
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>

    <!-- Outside the popover, so it is still there to report the colour once the popover has closed. It sits under the button, where the native picker opens -->
    <input
        bind:this={nativeInput}
        class="native-input"
        type="color"
        value={current}
        tabindex="-1"
        aria-hidden="true"
        onchange={(event) => select(event.currentTarget.value)}
    />
</span>

<style>
    .color-option {
        position: relative;
        display: inline-flex;
    }

    .native-input {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 0;
        padding: 0;
        border: 0;
        opacity: 0;
        pointer-events: none;
    }

    /* The icon of the button is a wide block of the colour, not the square icon of the other options. Three classes beat the size
       that ComponentEditorButton sets on its icon */
    :global(.scribe-btn.color-trigger .large-icon svg) {
        width: 1.75rem;
        height: 1.25rem;
    }

    /* The popover is portalled out of this component, so its styles are global. It is the card of the add-component dropdown */
    :global(.scribe-color-popover) {
        --scribe-border-strong: color-mix(in oklab, var(--scribe-doc-foreground) 22%, var(--scribe-section-background));
        --scribe-accent-wash: color-mix(in oklab, var(--scribe-accent) 9%, var(--scribe-section-background));
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        padding: 0.875rem;
        background-color: var(--scribe-popover);
        color: var(--scribe-popover-foreground);
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-xl);
        box-shadow: var(--scribe-shadow-float);
        outline: none;
        /* Same layer as the add-component dropdown */
        z-index: 30;
    }

    :global(.scribe-color-popover .color-title) {
        margin: 0;
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-semibold);
        line-height: 1.25;
    }

    :global(.scribe-color-popover .color-grid) {
        display: flex;
        flex-direction: column;
        gap: 0.3125rem;
        outline: none;
    }

    :global(.scribe-color-popover .color-row) {
        display: flex;
        gap: 0.3125rem;
    }

    /* The colours are the data of the palette, so they are fixed: they do not follow the theme. The hairline keeps the white and the pale ones visible */
    :global(.scribe-color-popover .color-swatch) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.375rem;
        height: 1.375rem;
        padding: 0;
        border: 0;
        border-radius: var(--scribe-radius-sm);
        cursor: pointer;
        color: oklch(1 0 0);
        box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--scribe-doc-foreground) 14%, transparent);
        transition: transform 120ms ease-out;
    }

    :global(.scribe-color-popover .color-swatch.is-light) {
        color: oklch(0.2 0 0);
    }

    :global(.scribe-color-popover .color-swatch:hover) {
        transform: scale(1.12);
    }

    :global(.scribe-color-popover .color-swatch:focus-visible) {
        outline-offset: 2px;
    }

    :global(.scribe-color-popover .scribe-btn.color-more) {
        justify-content: flex-start;
        gap: 0.5rem;
        color: var(--scribe-muted-foreground);
    }

    :global(.scribe-color-popover .scribe-btn.color-more:hover:not(:disabled)) {
        color: var(--scribe-doc-foreground);
    }

    @media (prefers-reduced-motion: reduce) {
        :global(.scribe-color-popover .color-swatch) {
            transition: none;
        }
    }
</style>
