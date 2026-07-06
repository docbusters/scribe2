<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { ChartComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import type { ArrayValue, DataValue, RecordValue } from '$lib/domain/data/DataValue.js';
    import { BarChart, LineChart, AreaChart, PieChart, Tooltip } from 'layerchart';
	import { capitalizeStrings } from '$lib/utils/capitalizeStrings.js';
	import { randomHexColor } from '$lib/utils/randomHexColor.js';

    let { componentData, resolvedValue, updateComponentConfig }: ScribeComponentProps<ChartComponent> = $props();

    const config = $derived(componentData.config);

    const arrayValue = $derived(resolvedValue as ArrayValue<RecordValue<string, DataValue>>);

    const chartData = $derived.by(() => {
        if (!arrayValue || arrayValue.type !== 'array') return [];
        return arrayValue.value.map((record) => {
            if (record.type !== 'record') return {};
            const item: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(record.value)) {
                item[key] = val.value;
            }
            return item;
        });
    });

    const xKey = $derived(config?.xAxisKey);
    const activeSeries = $derived(config?.series?.filter(s => s.key !== config?.xAxisKey) ?? []);

    $effect(() => {
        if (!arrayValue || arrayValue.type !== 'array' || arrayValue.value.length === 0) return;
        
        const firstRecord = arrayValue.value[0];
        if (firstRecord.type !== 'record') return;
        
        const currentDataKeys = Object.keys(firstRecord.value);
        const currentSeries = config?.series || [];
        
        let hasChanges = false;
        let newSeries = [...currentSeries];
        
        // Add new series
        for (const key of currentDataKeys) {
            if (key !== config?.xAxisKey && !newSeries.some(s => s.key === key)) {
                newSeries.push({
                    key,
                    label: capitalizeStrings(key),
                    color: randomHexColor()
                });
                hasChanges = true;
            }
        }
        
        // Remove missing series
        const initialLength = newSeries.length;
        newSeries = newSeries.filter(s => currentDataKeys.includes(s.key));
        if (newSeries.length !== initialLength) {
            hasChanges = true;
        }
        
        if (hasChanges && updateComponentConfig) {
            updateComponentConfig({
                ...config,
                series: newSeries,
            });
        }
    });
</script>

<div class="chart-container">
    {#if config && chartData.length > 0}
        {#if !xKey}
            <EmptyContent 
                message="Missing X-Axis" 
                description="Please configure the X-axis in the chart settings."
                icon='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V3"/><path d="M3 21h18"/><path d="M11 16l-4 4"/><path d="M15 12l-4 4"/></svg>' 
            />
        {:else if activeSeries.length === 0}
            <EmptyContent
                message="No Series Defined" 
                description="Add at least one data series to visualize the chart."
                icon='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>' 
            />
        {:else}
            <div class="chart-wrapper">
                {#if config.type === 'bar'}
                    <BarChart seriesLayout="group" data={chartData} x={xKey} series={activeSeries} props={{ bars: { class: 'bar-chart-bar', motion: { type: 'tween', duration: 500 } } }}>
                        {#snippet tooltip({ context })}
                            <Tooltip.Root {context} class="scribe-chart-tooltip">
                                {#snippet children({ data })}
                                    <Tooltip.Header value={data[xKey]} />
                                    <Tooltip.List>
                                        {#each activeSeries as s (s.key)}
                                            <Tooltip.Item label={s.label || capitalizeStrings(s.key)} value={data[s.key]} color={s.color} />
                                        {/each}
                                    </Tooltip.List>
                                {/snippet}
                            </Tooltip.Root>
                        {/snippet}
                    </BarChart>
                {:else if config.type === 'line'}
                    <LineChart data={chartData} x={xKey} series={activeSeries} props={{ spline: { draw: true } }}>
                        {#snippet tooltip({ context })}
                            <Tooltip.Root {context} class="scribe-chart-tooltip">
                                {#snippet children({ data })}
                                    <Tooltip.Header value={data[xKey]} />
                                    <Tooltip.List>
                                        {#each activeSeries as s (s.key)}
                                            <Tooltip.Item label={s.label || capitalizeStrings(s.key)} value={data[s.key]} color={s.color} />
                                        {/each}
                                    </Tooltip.List>
                                {/snippet}
                            </Tooltip.Root>
                        {/snippet}
                    </LineChart>
                {:else if config.type === 'area'}
                    <AreaChart data={chartData} x={xKey} series={activeSeries} props={{ area: { motion: 'tween' } }}>
                        {#snippet tooltip({ context })}
                            <Tooltip.Root {context} class="scribe-chart-tooltip">
                                {#snippet children({ data })}
                                    <Tooltip.Header value={data[xKey]} />
                                    <Tooltip.List>
                                        {#each activeSeries as s (s.key)}
                                            <Tooltip.Item label={s.label || capitalizeStrings(s.key)} value={data[s.key]} color={s.color} />
                                        {/each}
                                    </Tooltip.List>
                                {/snippet}
                            </Tooltip.Root>
                        {/snippet}
                    </AreaChart>
                {:else if config.type === 'pie'}
                    <PieChart
                        {...{ grid: false, rule: false }}
                        key={xKey}
                        value="value"
                        series={activeSeries.map((s, i) => ({
                            ...s,
                            color: undefined,
                            data: chartData.map(d => ({ [xKey]: d[xKey], value: d[s.key], _seriesKey: s.key })),
                            props: {
                                outerRadius: -(i * 30 + 0.1),
                                ...(i < activeSeries.length - 1 ? { innerRadius: -20 } : {})
                            }
                        }))}
                        padding={{ top: 5, bottom: 40, left: 5, right: 5 }}
                        props={{ pie: { motion: 'spring' } }}
                        legend={{
                            classes: {
                                root: 'pie-chart-root',
                                items: 'pie-chart-items',
                                swatch: 'pie-chart-color',
                                item: 'pie-chart-item',
                                label: 'pie-chart-label',
                            }
                        }}
                    >
                        {#snippet tooltip({ context })}
                            <Tooltip.Root {context} class="scribe-chart-tooltip">
                                {#snippet children({ data })}
                                    <Tooltip.Header value={data[xKey]} />
                                    <Tooltip.List>
                                        {#each activeSeries.filter(s => s.key === data._seriesKey) as s (s.key)}
                                            <Tooltip.Item label={s.label || capitalizeStrings(s.key)} value={data.value} color={context.cScale?.(context.c(data)) || s.color} />
                                        {/each}
                                    </Tooltip.List>
                                {/snippet}
                            </Tooltip.Root>
                        {/snippet}
                    </PieChart>
                {:else if config.type === 'arc'}
                    <PieChart
                        {...{ grid: false, rule: false }}
                        key={xKey}
                        value="value"
                        series={activeSeries.map((s, i) => ({
                            ...s,
                            color: undefined,
                            data: chartData.map(d => ({ [xKey]: d[xKey], value: d[s.key], _seriesKey: s.key })),
                            props: {
                                outerRadius: 220 - (i * 30),
                                innerRadius: 220 - (i * 30) - 20
                            }
                        }))}
                        range={[-90, 90]}
                        outerRadius={220}
                        cornerRadius={10}
                        padAngle={0.02}
                        props={{ group: { y: 220 / 2.25 }, pie: { motion: 'spring' } }}
                        legend={{
                            classes: {
                                root: 'pie-chart-root',
                                items: 'pie-chart-items',
                                swatch: 'pie-chart-color',
                                item: 'pie-chart-item',
                                label: 'pie-chart-label',
                            }
                        }}
                    >
                        {#snippet tooltip({ context })}
                            <Tooltip.Root {context} class="scribe-chart-tooltip">
                                {#snippet children({ data })}
                                    <Tooltip.Header value={data[xKey]} />
                                    <Tooltip.List>
                                        {#each activeSeries.filter(s => s.key === data._seriesKey) as s (s.key)}
                                            <Tooltip.Item label={s.label || capitalizeStrings(s.key)} value={data.value} color={context.cScale?.(context.c(data)) || s.color} />
                                        {/each}
                                    </Tooltip.List>
                                {/snippet}
                            </Tooltip.Root>
                        {/snippet}
                    </PieChart>
                {/if}
            </div>
        {/if}
    {:else}
        <EmptyContent
            message="Chart component is missing configuration or data"
            icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-chart-column&quot;><path d=&quot;M3 3v16a2 2 0 0 0 2 2h16&quot;/><path d=&quot;M18 17V9&quot;/><path d=&quot;M13 17V5&quot;/><path d=&quot;M8 17v-3&quot;/></svg>"
            isError
        />
    {/if}
</div>

<style>
    .chart-container {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-2xl);
        background-color: var(--scribe-section-background);
        font-family: var(--scribe-font-sans);
    }
    .chart-wrapper {
        width: 100%;
        height: 300px;
    }
    :global(.scribe-chart-tooltip) {
        font-family: var(--scribe-font-sans);
    }
    :global(.bar-chart-bar) {
        stroke-width: 0;
    }
    :global(.pie-chart-item) {
        border: 0;
        background-color: transparent;
    }
    :global(.pie-chart-label) {
        font-family: var(--scribe-font-sans);
        color: var(--scribe-text-color);
        font-size: var(--scribe-font-size-sm);
    }
    :global(.pie-chart-color) {
        width: 0.5rem;
        height: 0.5rem;
    }
    :global(.pie-chart-items) {
        justify-content: center;
    }
    :global(.pie-chart-root) {
        width: 100%;
    }
</style>
