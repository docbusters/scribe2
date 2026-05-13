<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextInputComponent } from '$lib/domain/components/DefaultComponents.js';
	import { dataStore } from '$lib/stores/data-store.svelte.js';

    let { componentData }: ScribeComponentProps<TextInputComponent> = $props();

    const bindValue = $derived(componentData.value)
    const config = $derived(componentData.config)

    const style = $derived.by(() => {
        let styleString = '';

        if (config?.expandWithContent) {
            styleString += 'field-sizing: content;';
        }

        return styleString;
    });
</script>

<input id={componentData.id} {style} placeholder={config?.placeholder} class="text-input" type="text" bind:value={dataStore.data[bindValue.id].value} />

<style>
    .text-input {
        padding: 0.5em;
        border: 1px solid #ccc;
        border-radius: 0.5em;
        min-width: 10rem;
    }
</style>
