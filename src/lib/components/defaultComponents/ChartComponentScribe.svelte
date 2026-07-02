<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { ChartComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import type { ArrayValue, DataValue, RecordValue } from '$lib/domain/data/DataValue.js';
    import { BarChart, LineChart, AreaChart, PieChart, Tooltip } from 'layerchart';
	import { capitalizeStrings } from '$lib/utils/capitalizeStrings.js';

    let { componentData, resolvedValue }: ScribeComponentProps<ChartComponent> = $props();

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

    const xKey = $derived(config?.xAxisKey || 'label');
    const primaryYKey = $derived(config?.series?.[0]?.key || 'value1');

    $effect(() => {
        console.log(chartData);
        console.log(xKey, primaryYKey)
    })

</script>

<div class="chart-container">
    {#if config && chartData.length > 0}
        <div class="chart-wrapper">
            {#if config.type === 'bar'}
                <BarChart data={chartData} x={xKey} y={primaryYKey}>
                    {#snippet tooltip({ context })}
                        <Tooltip.Root {context} class="scribe-chart-tooltip">
                            {#snippet children({ data })}
                                <Tooltip.Header value={data[xKey]} />
                                <Tooltip.List>
                                    <Tooltip.Item label={capitalizeStrings(primaryYKey)} value={data[primaryYKey]} />
                                </Tooltip.List>
                            {/snippet}
                        </Tooltip.Root>
                    {/snippet}
                </BarChart>
            {:else if config.type === 'line'}
                <LineChart data={chartData} x={xKey} y={primaryYKey}>
                    {#snippet tooltip({ context })}
                        <Tooltip.Root {context} class="scribe-chart-tooltip">
                            {#snippet children({ data })}
                                <Tooltip.Header value={data[xKey]} />
                                <Tooltip.List>
                                    <Tooltip.Item label={capitalizeStrings(primaryYKey)} value={data[primaryYKey]} />
                                </Tooltip.List>
                            {/snippet}
                        </Tooltip.Root>
                    {/snippet}
                </LineChart>
            {:else if config.type === 'area'}
                <AreaChart data={chartData} x={xKey} y={primaryYKey}>
                    {#snippet tooltip({ context })}
                        <Tooltip.Root {context} class="scribe-chart-tooltip">
                            {#snippet children({ data })}
                                <Tooltip.Header value={data[xKey]} />
                                <Tooltip.List>
                                    <Tooltip.Item label={capitalizeStrings(primaryYKey)} value={data[primaryYKey]} />
                                </Tooltip.List>
                            {/snippet}
                        </Tooltip.Root>
                    {/snippet}
                </AreaChart>
            {:else if config.type === 'pie'}
                <PieChart data={chartData} key={xKey} value={primaryYKey}>
                    {#snippet tooltip({ context })}
                        <Tooltip.Root {context} class="scribe-chart-tooltip">
                            {#snippet children({ data })}
                                <Tooltip.Header value={data[xKey]} />
                                <Tooltip.List>
                                    <Tooltip.Item label={capitalizeStrings(primaryYKey)} value={data[primaryYKey]} />
                                </Tooltip.List>
                            {/snippet}
                        </Tooltip.Root>
                    {/snippet}
                </PieChart>
            {/if}
        </div>
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
        --primary: var(--scribe-primary, #3b82f6);
    }
    :global(.fill-primary) {
        fill: var(--primary);
    }
    :global(.stroke-primary) {
        stroke: var(--primary);
    }
    :global(.fill-primary\/20) {
        fill: var(--primary);
        opacity: 0.2;
    }
    :global(.scribe-chart-tooltip) {
        font-family: var(--scribe-font-sans);
    }
</style>
