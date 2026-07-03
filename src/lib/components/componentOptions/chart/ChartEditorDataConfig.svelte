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

    let { name, icon, sectionId, disabled, componentId, componentValue, isSelected }: ComponentEditProps = $props();

    let open = $state(false);

    // Form states
    let draftSeries = $state<{key: string, label: string, color: string}[]>([]);
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
        return Array.from(keys).map(key => ({ value: key, label: key }));
    });

    function addSeries() {
        if (!newLabel) return;
        
        const calculatedKey = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!calculatedKey) return;
        
        if (draftSeries.some(s => s.key === calculatedKey) || existingKeys.includes(calculatedKey)) {
            return;
        }
        
        draftSeries = [...draftSeries, { key: calculatedKey, label: newLabel, color: '#ff9999' }];
        draftDeletedSeriesKeys.delete(calculatedKey);
        
        newLabel = '';
    }

    function removeSeries(keyToRemove: string) {
        draftSeries = draftSeries.filter(s => s.key !== keyToRemove);
        draftDeletedSeriesKeys.add(keyToRemove);
        if (selectedKey === keyToRemove) {
            selectedKey = undefined;
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
    {isSelected}
    {disabled}
    onclick={() => {
        selectedKey = config?.xAxisKey;
        draftSeries = config?.series ? config.series.map(s => ({...s, color: s.color || '#ff9999'})) : [];
        draftDeletedSeriesKeys.clear();
        open = true;
    }}
/>

<Dialog bind:open title="Chart Data Configuration">
    <div class="data-config-container">
        
        <div class="config-section">
            <div class="section-header">
                <div class="title-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    <h5>Data Source</h5>
                </div>
                <p class="section-desc">Select the property that will serve as the X-axis for the chart.</p>
            </div>
            <Select
                placeholder="X-Axis"
                type="single"
                items={availableKeys}
                bind:value={selectedKey}
            />
        </div>

        <Divider />

        <div class="config-section">
            <div class="section-header">
                <div class="title-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <h5>Data Series</h5>
                </div>
                <p class="section-desc">Configure the metrics and data series to display on the chart.</p>
            </div>
            <div class="current-series">
                {#if draftSeries.length > 0}
                    <ul>
                        {#each draftSeries as s, i (s.key)}
                            <li class="series-card">
                                <div class="series-info">
                                    <div class="color-picker-container">
                                        <input type="color" bind:value={draftSeries[i].color} class="color-picker" title="Change color" />
                                        <div class="color-picker-ring" style="border-color: {draftSeries[i].color};"></div>
                                    </div>
                                    <div class="series-text">
                                        <span class="series-label">{s.label}</span>
                                    </div>
                                </div>
                                <button class="delete-btn" onclick={() => removeSeries(s.key)} title="Remove series">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                </button>
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

            <div class="add-series-card">
                <p class="add-series-title">Add New Series</p>
                <div class="add-form">
                    <TextInput bind:value={newLabel} placeholder="Label" />
                    <Button onclick={addSeries} disabled={!newLabel} variant="default">Add</Button>
                </div>
            </div>
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
        padding: 0.5rem 0 0.5rem 0;
    }
    
    .config-section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section-header {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .section-icon {
        color: var(--scribe-primary, #3b82f6);
    }

    h5 {
        margin: 0;
        font-family: var(--scribe-font-heading);
        font-size: var(--scribe-font-size-md);
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--scribe-text-color);
    }

    .section-desc {
        margin: 0;
        font-size: var(--scribe-font-size-sm);
        color: var(--scribe-muted-foreground);
        line-height: 1.4;
    }

    /* Series Cards */
    .current-series ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .series-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-md);
        background: linear-gradient(145deg, var(--scribe-background), var(--scribe-muted));
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .series-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background-color: transparent;
        transition: background-color 0.3s;
    }
    .series-card:hover::before {
        background-color: var(--scribe-primary, #3b82f6);
    }

    .series-card:hover {
        border-color: var(--scribe-border-color-hover, var(--scribe-muted-foreground));
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    
    .series-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .series-text {
        display: flex;
        align-items: center;
    }

    .series-label {
        font-size: var(--scribe-font-size-sm);
        font-weight: 500;
        color: var(--scribe-text-color);
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
        transition: transform 0.3s, opacity 0.3s;
        pointer-events: none;
    }

    .series-card:hover .color-picker-ring {
        transform: scale(1.1);
        opacity: 0.3;
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
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1) inset;
        transition: transform 0.2s;
    }
    .color-picker:hover {
        transform: scale(1.1);
    }

    .color-picker::-webkit-color-swatch-wrapper { padding: 0; }
    .color-picker::-webkit-color-swatch { border: none; border-radius: 50%; }
    .color-picker::-moz-color-swatch { border: none; border-radius: 50%; }
    
    .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: none;
        background: transparent;
        color: var(--scribe-muted-foreground);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
        opacity: 0;
        transform: translateX(10px);
    }
    .series-card:hover .delete-btn {
        opacity: 1;
        transform: translateX(0);
    }
    .delete-btn:hover {
        margin-bottom: 0.5rem;
    }

    /* Add Series Card */
    .add-series-card {
        margin-top: 0.5rem;
        padding: 1.25rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        background-color: var(--scribe-background);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    
    .add-series-title {
        margin: 0 0 0.75rem 0;
        font-size: var(--scribe-font-size-sm);
        font-weight: 600;
        color: var(--scribe-text-color);
    }

    .add-form {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
    }

    .add-form :global(> *:first-child) {
        flex: 1;
    }
</style>
