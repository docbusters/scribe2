<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { Document } from '../domain/Document.js';
    import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
    import type { BaseComponent } from '../domain/components/Component.js';
    import type { DataValue } from '../domain/data/DataValue.js';
    import { defaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { DEFAULT_SECTION_SEPARATION } from '$lib/constants/DocumentConstants.js';
	import { dataStore } from '$lib/stores/data-store.svelte.js';
	
    interface ScribeProps {
        document: Document<C>;
        registry?: ComponentRegistry<C>;
    }

    let { document, registry }: ScribeProps = $props();

    $effect.pre(() => {
        // Initialize the global registry with the default components and any custom components provided via props
        globalRegistry.initialize({
            ...defaultRegistry,
            ...(registry || {})
        } as ComponentRegistry<C>);
    });

    $effect.pre(() => {
        // Initialize the data store with the initial values from the document's components
        dataStore.initialize(document.bindings);
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
