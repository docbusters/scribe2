<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import { stringifyDataValue } from '../../utils/stringifyDataValue.js';
	import type { ImageComponent } from '../../domain/components/DefaultComponents.js';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import { fade } from 'svelte/transition';

    let { componentData }: ScribeComponentProps<ImageComponent> = $props();

    let errorLoadingImage = $state(false);

    const value = $derived(stringifyDataValue(componentData.value));
    const config = $derived(componentData.config);

    $effect(() => {
        // We interact with value so that error state is reset when it changes
        void value; 
        errorLoadingImage = false;
    });

    const style = $derived.by(() => {
        let styleString = '';

        if (config?.position) {
            styleString += `object-fit: ${config.position};`;
        } else {
            styleString += 'object-fit: cover;';
        }

        if (config?.align) {
            styleString += `object-position: ${config.align};`;
        } else {
            styleString += 'object-position: center;';
        }

        return styleString;
    })
</script>

{#key value}
    <div class="image-container" in:fade>
        {#if value && !errorLoadingImage}
            <img style={style} height={config?.height} width={config?.width} onerror={() => errorLoadingImage = true} id={componentData.id} src={value} alt={componentData.id} />   
        {:else if errorLoadingImage}
            <EmptyContent
                style="padding: 2rem;"
                message={config?.errorText || "Image failed to load"}
                icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-image-off-icon lucide-image-off&quot;><line x1=&quot;2&quot; x2=&quot;22&quot; y1=&quot;2&quot; y2=&quot;22&quot;/><path d=&quot;M10.41 10.41a2 2 0 1 1-2.83-2.83&quot;/><line x1=&quot;13.5&quot; x2=&quot;6&quot; y1=&quot;13.5&quot; y2=&quot;21&quot;/><line x1=&quot;18&quot; x2=&quot;21&quot; y1=&quot;12&quot; y2=&quot;15&quot;/><path d=&quot;M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59&quot;/><path d=&quot;M21 15V5a2 2 0 0 0-2-2H9&quot;/></svg>"
                isError
            />   
        {:else}
            <EmptyContent
                style="padding: 2rem;"
                message={config?.emptyText || "Set an image URL"}
                icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-image-icon lucide-image&quot;><rect width=&quot;18&quot; height=&quot;18&quot; x=&quot;3&quot; y=&quot;3&quot; rx=&quot;2&quot; ry=&quot;2&quot;/><circle cx=&quot;9&quot; cy=&quot;9&quot; r=&quot;2&quot;/><path d=&quot;m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21&quot;/></svg>"
            /> 
        {/if}
    </div>
{/key}

<style>
    img {
        width: 100%;
        aspect-ratio: initial;
    }

    .image-container {
        flex: 1;
        overflow: hidden;
        min-height: 133px;
        border-radius: var(--scribe-radius-2xl);
    }
</style>
