<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { Document } from '../domain/Document.js';
    import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
    import type { BaseComponent } from '../domain/components/Component.js';
    import type { DataValue } from '../domain/data/DataValue.js';
    import { defaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { DEFAULT_SECTION_SEPARATION } from '$lib/constants/DocumentConstants.js';
	
    interface ScribeProps {
        document: Document<C>;
        registry?: ComponentRegistry<C>;
    }

    let { document, registry }: ScribeProps = $props();

    $effect.pre(() => {
        globalRegistry.initialize({
            ...defaultRegistry,
            ...(registry || {})
        } as ComponentRegistry<C>);
    });

    const documentStyle = $derived.by(() => {
        const separation = document.sectionSeparation ?? DEFAULT_SECTION_SEPARATION;
        
        return `gap: ${separation}px;`;
    });

</script>

<div class="w-full flex flex-col" style={documentStyle}>
    {#each document.sections as section, index (index)}
        <Section data={section} />
    {/each}
</div>
