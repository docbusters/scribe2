<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
    import type { TextComponent } from '../../domain/components/TextComponent.ts';

    let { componentData }: ScribeComponentProps<TextComponent> = $props();

</script>

<span class="scribe-text">
    {componentData.value.value}
</span>
