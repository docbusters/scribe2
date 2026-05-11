<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';
	import type { TextComponent } from '$lib/domain/components/DefaultComponents.js';

    let { componentData }: ScribeComponentProps<TextComponent> = $props();

    const value = $derived(stringifyDataValue(componentData.value));
</script>

<p>
    {value}
</p>
