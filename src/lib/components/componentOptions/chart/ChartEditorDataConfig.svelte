<script lang="ts">
    import type { ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
    import type { ChartComponentConfig } from '$lib/domain/components/DefaultComponentsConfig.js';
    import type { ArrayValue, DataValue, RecordValue } from '$lib/domain/data/DataValue.js';
    import { editStore } from '$lib/stores/edit-store.svelte.js';
    import Dialog from '$lib/components/utilComponents/Dialog.svelte';
    import TextInput from '$lib/components/utilComponents/TextInput.svelte';
    import Button from '$lib/components/utilComponents/Button.svelte';
    import Select from '$lib/components/utilComponents/Select.svelte';
    import EmptyContent from '$lib/components/utilComponents/EmptyContent.svelte';
    import ComponentEditorButton from '$lib/components/component/ComponentEditorButton.svelte';
    import Divider from '$lib/components/utilComponents/Divider.svelte';
	import { SvelteSet } from 'svelte/reactivity';
    import { randomHexColor } from '$lib/utils/randomHexColor.js';

    let { name, icon, label, sectionId, disabled, componentId, componentValue, isSelected, isBinding }: ComponentEditProps = $props();

    let open = $state(false);

    // Form states
    let draftSeries = $state<{key: string, label: string, color: string, hidden?: boolean}[]>([]);
    let draftDeletedSeriesKeys = $state(new Set<string>());
    let selectedKey = $state<string>();
    let newLabel = $state('');

    const config = $derived(editStore.getComponentConfig(sectionId, componentId) as ChartComponentConfig);

    const existingKeys = $derived.by(() => {
        if (!componentValue || componentValue.type !== 'array') return [];
        const arr = componentValue as ArrayValue<DataValue>;
        if (arr.value.length === 0) return [];
        const firstRecord = arr.value[0];
        if (firstRecord.type !== 'record') return [];
        const rec = firstRecord as RecordValue<string, DataValue>;
        return Object.keys(rec.value);
    });

    const availableKeys = $derived.by(() => {
        const keys = new SvelteSet<string>();
        existingKeys.forEach(k => keys.add(k));
        draftSeries.forEach(s => keys.add(s.key));
        draftDeletedSeriesKeys.forEach(k => keys.delete(k));
        return Array.from(keys).map(key => {
            const seriesInfo = draftSeries.find(s => s.key === key);
            return { value: key, label: seriesInfo ? seriesInfo.label : key };
        });
    });

    function addSeries() {
        const keyToAdd = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!keyToAdd || draftSeries.some(s => s.key === keyToAdd)) {
            return;
        }
        
        draftSeries = [...draftSeries, { 
            key: keyToAdd, 
            label: newLabel, 
            color: randomHexColor() 
        }];
        draftDeletedSeriesKeys.delete(keyToAdd);
        
        newLabel = '';
    }

    function toggleOrRemoveSeries(keyToRemove: string) {
        if (isBinding) {
            draftSeries = draftSeries.map(s => s.key === keyToRemove ? { ...s, hidden: !s.hidden } : s);
        } else {
            draftSeries = draftSeries.filter(s => s.key !== keyToRemove);
            draftDeletedSeriesKeys.add(keyToRemove);
            if (selectedKey === keyToRemove) {
                selectedKey = undefined;
            }
        }
    }

    function saveChanges() {
        // Update config
        editStore.setComponentConfig(sectionId, componentId, {
            ...config,
            xAxisKey: selectedKey,
            series: draftSeries
        });

        // Update RecordValues
        if (componentValue && componentValue.type === 'array') {
            const arr = componentValue as ArrayValue<DataValue>;
            const keysToAdd = draftSeries.map(s => s.key).filter(k => !existingKeys.includes(k));
            const keysToDelete = Array.from(draftDeletedSeriesKeys).filter(k => existingKeys.includes(k));
            
            if (arr.value.length === 0) {
                if (keysToAdd.length > 0) {
                    const newRecValue: Record<string, DataValue> = {};
                    for (const k of keysToAdd) {
                        newRecValue[k] = { type: 'number', value: 0 } as DataValue;
                    }
                    editStore.setComponentValue(sectionId, componentId, {
                        type: 'array',
                        value: [{ type: 'record', value: newRecValue } as RecordValue<string, DataValue>]
                    } as ArrayValue<DataValue>);
                }
            } else if (keysToAdd.length > 0 || keysToDelete.length > 0) {
                const newValue = arr.value.map(item => {
                    if (item.type === 'record') {
                        const itemRec = item as RecordValue<string, DataValue>;
                        const newRecValue = { ...itemRec.value };
                        
                        for (const k of keysToAdd) {
                            newRecValue[k] = { type: 'number', value: 0 } as DataValue;
                        }
                        for (const k of keysToDelete) {
                            delete newRecValue[k];
                        }
                        
                        return {
                            ...itemRec,
                            value: newRecValue
                        } as RecordValue<string, DataValue>;
                    }
                    return item;
                });
                
                editStore.setComponentValue(sectionId, componentId, {
                    type: 'array',
                    value: newValue
                } as ArrayValue<DataValue>);
            }
        }

        open = false;
    }
</script>

<ComponentEditorButton
    {icon}
    {name}
    {label}
    {isSelected}
    {disabled}
    onclick={() => {
        selectedKey = config?.xAxisKey;
        draftSeries = config?.series ? config.series.map(s => ({...s, color: s.color || 'var(--scribe-primary)'})) : [];
        draftDeletedSeriesKeys.clear();
        open = true;
    }}
/>

<Dialog bind:open title="Chart Data Configuration">
    <div class="data-config-container">
        
        <div class="config-section">
            <div class="section-header">
                <h3 class="section-title">Data Source</h3>
                <p class="section-desc">Select the property that will serve as the X-axis for the chart.</p>
            </div>
            <Select
                label="X-Axis"
                type="single"
                items={availableKeys}
                bind:value={selectedKey}
            />
        </div>

        <Divider />

        <div class="config-section">
            <div class="section-header">
                <h3 class="section-title">Data Series</h3>
                <p class="section-desc">Configure the metrics and data series to display on the chart.</p>
            </div>
            <div class="current-series">
                {#if draftSeries.length > 0}
                    <ul>
                        {#each draftSeries.filter(s => s.key !== selectedKey) as s, i (s.key)}
                            <li class="series-card {s.hidden ? 'is-hidden' : ''}">
                                <div class="series-info">
                                    <div class="color-picker-container">
                                        <input type="color" bind:value={draftSeries[i].color} class="color-picker" title="Change color" aria-label="Change color" />
                                        <div class="color-picker-ring" style="border-color: {draftSeries[i].color};"></div>
                                    </div>
                                    <div class="series-text">
                                        <span class="series-label">{s.label}</span>
                                        <span class="series-key">{s.key}</span>
                                    </div>
                                </div>
                                <span class="series-action">
                                    <Button size="icon-sm" variant="ghost-destructive" title={isBinding ? (s.hidden ? "Show series" : "Hide series") : "Remove series"} aria-label={isBinding ? (s.hidden ? "Show series" : "Hide series") : "Remove series"} onclick={() => toggleOrRemoveSeries(s.key)}>
                                        {#if isBinding}
                                            {#if s.hidden}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.579 1 1 0 0 1 0 .69J12"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                            {:else}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                            {/if}
                                        {:else}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        {/if}
                                    </Button>
                                </span>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <EmptyContent 
                        icon='<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'
                        message="No series defined"
                        description="Add a new series below to get started."
                    />
                {/if}
            </div>

            {#if !isBinding}
            <div class="add-series-card">
                <p class="add-series-title">Add New Series</p>
                <div class="add-form">
                    <TextInput bind:value={newLabel} label="Series Label" />
                    <Button onclick={addSeries} disabled={!newLabel} variant="default">Add</Button>
                </div>
            </div>
            {/if}
        </div>

    </div>
    
    {#snippet footer()}
        <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
        <Button onclick={saveChanges} disabled={!selectedKey}>Save Changes</Button>
    {/snippet}
</Dialog>

<style>
    .data-config-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .config-section {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
    }

    .section-header {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .section-title {
        margin: 0;
        font-family: var(--scribe-font-heading);
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-semibold);
        color: var(--scribe-doc-foreground);
    }

    .section-desc {
        margin: 0;
        font-size: var(--scribe-font-size-sm);
        color: var(--scribe-muted-foreground);
        line-height: 1.4;
    }

    /* Series rows */
    .current-series ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .series-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.5rem 0.5rem 0.75rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        background-color: var(--scribe-section-background);
        transition: border-color 150ms ease-out;
    }

    .series-card:hover,
    .series-card:focus-within {
        border-color: var(--scribe-border-strong);
    }

    .series-card.is-hidden {
        opacity: 0.55;
        border-style: dashed;
        background-color: var(--scribe-muted);
    }

    .series-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .series-text {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .series-label {
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-medium);
        color: var(--scribe-doc-foreground);
    }

    .series-key {
        font-size: var(--scribe-font-size-xs);
        color: var(--scribe-muted-foreground);
    }

    .color-picker-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
    }

    .color-picker-ring {
        position: absolute;
        inset: -2px;
        border: 2px solid transparent;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 150ms ease-out;
        pointer-events: none;
    }

    .series-card:hover .color-picker-ring {
        opacity: 0.35;
    }

    .color-picker {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 1.5rem;
        height: 1.5rem;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        background: none;
        overflow: hidden;
        z-index: 1;
        box-shadow: inset 0 0 0 1px var(--scribe-border-strong);
    }

    .color-picker::-webkit-color-swatch-wrapper { padding: 0; }
    .color-picker::-webkit-color-swatch { border: none; border-radius: 50%; }
    .color-picker::-moz-color-swatch { border: none; border-radius: 50%; }

    .series-action {
        display: flex;
    }

    /* Shown on hover or keyboard focus. Touch screens have no hover, so it stays visible there. */
    @media (hover: hover) {
        .series-action {
            opacity: 0;
            transition: opacity 150ms ease-out;
        }

        .series-card:hover .series-action,
        .series-card:focus-within .series-action {
            opacity: 1;
        }
    }

    /* Add series */
    .add-series-card {
        padding: 1rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        background-color: var(--scribe-muted);
    }

    .add-series-title {
        margin: 0 0 0.75rem 0;
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-semibold);
        color: var(--scribe-doc-foreground);
    }

    .add-form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
    }

    .add-form :global(> *:first-child) {
        flex: 1;
    }
</style>
