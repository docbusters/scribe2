<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';
	import type { ImageComponent } from '$lib/domain/components/DefaultComponents.js';

    let { componentData }: ScribeComponentProps<ImageComponent> = $props();

    let errorLoadingImage = $state(false);

    const value = $derived(stringifyDataValue(componentData.value));

    $effect(() => {
        // We interact with value so that error state is reset when it changes
        void value; 
        errorLoadingImage = false;
    });
</script>

<div class="image-container">
    {#if value && !errorLoadingImage}
        <img onerror={() => errorLoadingImage = true} id={componentData.id} src={value} alt={componentData.id} />   
    {:else if errorLoadingImage}
        <div class="error-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off-icon lucide-image-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>
            <p>Image does not exist</p>
        </div>    
    {:else}
        <div class="error-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <p>Set an image URL</p>
        </div>
    {/if}
</div>

<style>
    img {
        width: 100%;
        height: 100%;
        aspect-ratio: initial;
    }

    .image-container {
        flex: 1;
        overflow: hidden;
        background-color: var(--scribe-doc-background);
        border: 1px dashed var(--scribe-border-color);
        border-radius: var(--scribe-radius-2xl);
        font-weight: var(--scribe-font-weight-semibold);
        font-size: var(--scribe-font-size-sm);
    }
    
    .error-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-direction: column;
        padding: 2rem;
    }

    svg {
        padding: 0.5rem;
        border-radius: var(--scribe-radius-xl);
        background-color: var(--scribe-secondary-background);
    }
</style>
