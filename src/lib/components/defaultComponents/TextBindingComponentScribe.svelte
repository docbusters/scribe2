<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextBindingComponent } from '../../domain/components/DefaultComponents.ts';

    let { componentData, resolvedValue, mode }: ScribeComponentProps<TextBindingComponent> = $props();

    let value = $derived(resolvedValue.value as string);
</script>

<span 
    class="scribe-text-binding"
    class:is-editing={mode === 'edit'}
    id={componentData.id}
>
    {value}
</span>

<style>
    .scribe-text-binding {
        padding: 0 0.25rem;
    }
    
    .is-editing {
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
    }
</style>
