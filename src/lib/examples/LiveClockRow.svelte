<script lang="ts">
    import type { BindingItemProps } from '../types/ScribeProps.js';
    import { getI18n } from '../i18n/i18n.svelte.js';

    // Example of the row of a custom binding drawn by the host app, here with a Svelte component (see `createSvelteItemRenderer`).
    // The binding sets `bareItems`, so Scribe keeps only the button of the row (selection, keyboard, focus ring) and draws no frame:
    // the card, its selected and disabled states and the check are drawn here from `isSelected` and `isDisabled`
    let { label, preview, isLoading, isSelected, isDisabled }: BindingItemProps = $props();

    const i18n = getI18n();
</script>

<span class="clock-row" class:is-selected={isSelected} class:is-disabled={isDisabled}>
    <!-- The tile of the date type, as a clock is a time and not the text its value really is -->
    <span class="scribe-tile" data-size="sm" data-type="date">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    </span>

    <span class="clock-text">
        <span class="clock-title">{label}</span>
        <span class="clock-detail">{isLoading ? i18n.t('common.loading') : preview}</span>
    </span>

    <span class="scribe-check" class:is-checked={isSelected} aria-hidden="true">
        {#if isSelected}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        {/if}
    </span>
</span>

<style>
    .clock-row {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        min-width: 0;
        min-height: 3.25rem;
        padding: 0.5rem 0.75rem;
        background-color: var(--scribe-section-background);
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-xl);
        text-align: left;
        box-sizing: border-box;
        transition: background-color 150ms ease-out, border-color 150ms ease-out;
    }

    .clock-row:hover:not(.is-disabled) {
        background-color: var(--scribe-muted);
        border-color: var(--scribe-border-strong);
    }

    .clock-row.is-selected {
        background-color: var(--scribe-accent-wash);
        border-color: var(--scribe-primary);
    }

    .clock-row.is-disabled {
        opacity: 0.55;
        border-style: dashed;
        background-color: var(--scribe-muted);
    }

    .clock-text {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        flex: 1;
        min-width: 0;
    }

    .clock-title {
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-semibold);
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .clock-detail {
        font-size: var(--scribe-font-size-xs);
        font-variant-numeric: tabular-nums;
        line-height: 1.3;
        color: var(--scribe-muted-foreground);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
