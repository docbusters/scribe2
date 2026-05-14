<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.js';
    import type { DataValue } from '../../domain/data/DataValue.js';
    import { type DefaultComponents } from '../../registry/defaultRegistry.js';
	import type { BlockSection } from '$lib/domain/Section.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import type { ScribeComponentProps } from '$lib/registry/ComponentRegistry.js';
	import type { Component } from 'svelte';
	import type { ScribeMode } from '$lib/types/ScribeProps.js';
	
    interface BlockSectionProps {
        data: BlockSection<DefaultComponents | C>;
        mode: ScribeMode;
    }

    let { data, mode }: BlockSectionProps = $props();

    let component = $derived(data.content);
    let BlockComponent = $derived(globalRegistry.getComponent(component.type) as Component<ScribeComponentProps<typeof component>>);
</script>

<div class="block-section">
    <BlockComponent componentData={component} sectionId={data.id} {mode} />
</div>

<style>
    .block-section {
        display: flex;
        flex: 1;
    }
</style>

