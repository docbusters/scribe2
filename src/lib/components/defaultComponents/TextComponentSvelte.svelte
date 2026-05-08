<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
    import type { TextComponent } from '../../domain/components/TextComponent.ts';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';

    let { componentData }: ScribeComponentProps<TextComponent> = $props();

    const value = $derived(stringifyDataValue(componentData.value));
</script>

<p>
    {value}
</p>
