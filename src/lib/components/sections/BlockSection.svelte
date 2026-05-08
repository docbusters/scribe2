<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.js';
    import type { DataValue } from '../../domain/data/DataValue.js';
    import { type DefaultComponents } from '../../registry/defaultRegistry.js';
	import type { BlockSection } from '$lib/domain/Section.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import type { ScribeComponentProps } from '$lib/registry/ComponentRegistry.js';
	import type { Component } from 'svelte';
	
    interface BlockSectionProps {
        data: BlockSection<DefaultComponents | C>;
    }

    let { data }: BlockSectionProps = $props();

    let component = $derived(data.content);
    let BlockComponent = $derived(globalRegistry.getComponent(component.type) as Component<ScribeComponentProps<typeof component>>);
</script>

<div class="flex flex-1 bg-amber-200">
    <BlockComponent componentData={component} />
</div>
