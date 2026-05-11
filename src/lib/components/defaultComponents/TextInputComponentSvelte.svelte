<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextInputComponent } from '$lib/domain/components/DefaultComponents.ts';
	import { dataStore } from '$lib/stores/data-store.svelte.js';

    let { componentData }: ScribeComponentProps<TextInputComponent> = $props();

    const bindValue = $derived(componentData.value)
</script>

<input type="text" class="border" bind:value={dataStore.data[bindValue.id].value} />
