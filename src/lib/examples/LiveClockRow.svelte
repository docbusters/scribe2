<script lang="ts">
    import type { BindingItemProps } from '../types/ScribeProps.js';
    import { getI18n } from '../i18n/i18n.svelte.js';

    // Example of the row of a custom binding drawn by the host app, here with a Svelte component (see `createSvelteItemRenderer`).
    // Scribe keeps the button of the row, its selection and the check: this is only what goes inside
    let { label, preview, isLoading }: BindingItemProps = $props();

    const i18n = getI18n();
</script>

<span class="clock-row">
    <!-- The tile of the date type, as a clock is a time and not the text its value really is -->
    <span class="scribe-tile" data-size="sm" data-type="date">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    </span>

    <span class="clock-text">
        <span class="clock-title">{label}</span>
        <span class="clock-detail">{isLoading ? i18n.t('common.loading') : preview}</span>
    </span>
</span>

<style>
    .clock-row {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        min-width: 0;
    }

    .clock-text {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
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
