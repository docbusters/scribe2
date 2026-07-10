<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { ImageComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import Skeleton from '../utilComponents/Skeleton.svelte';
	import { fade } from 'svelte/transition';

    let { componentData, resolvedValue, updateComponentConfig, mode }: ScribeComponentProps<ImageComponent> = $props();

    let errorLoadingImage = $state(false);
    let imageLoaded = $state(false);

    let isDragging = $state(false);
    let tempWidth = $state<string | null>(null);
    let tempHeight = $state<string | null>(null);
    let containerRef: HTMLDivElement | undefined = $state();

    let startX = 0;
    let startY = 0;
    let initialWidth = 0;
    let initialHeight = 0;
    let containerWidth = 0;
    let dragMode: 'both' | 'width' | 'height' | null = null;

    const src = $derived(resolvedValue.value as string);
    const config = $derived(componentData.config);

    $effect(() => {
        // We interact with value so that error state is reset when it changes
        void resolvedValue; 
        errorLoadingImage = false;
        imageLoaded = false;
    });

    const style = $derived.by(() => {
        let styleString = '';

        if (config?.position) {
            styleString += `object-fit: ${config.position};`;
        } else {
            styleString += 'object-fit: contain;';
        }

        if (config?.align) {
            styleString += `object-position: ${config.align};`;
        } else {
            styleString += 'object-position: center;';
        }

        return styleString;
    });

    function onPointerDown(e: PointerEvent, type: 'both' | 'width' | 'height') {
        if (mode !== 'edit') return;
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);

        isDragging = true;
        dragMode = type;
        startX = e.clientX;
        startY = e.clientY;

        if (containerRef) {
            const rect = containerRef.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            const parent = containerRef.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                containerWidth = parentRect.width;
            }
        }
    }

    function onPointerMove(e: PointerEvent) {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (dragMode === 'both' || dragMode === 'width') {
            const newWidth = Math.max(50, initialWidth + deltaX);
            if (containerWidth > 0) {
                const percentage = (newWidth / containerWidth) * 100;
                tempWidth = `${percentage.toFixed(2)}%`;
            } else {
                tempWidth = `${newWidth}px`;
            }
        }

        if (dragMode === 'both' || dragMode === 'height') {
            const newHeight = Math.max(50, initialHeight + deltaY);
            tempHeight = `${newHeight}px`;
        }
    }

    function onPointerUp(e: PointerEvent) {
        if (!isDragging) return;
        isDragging = false;
        dragMode = null;

        const target = e.target as HTMLElement;
        target.releasePointerCapture(e.pointerId);

        let newConfig = { ...config };
        if (tempWidth) newConfig.width = tempWidth;
        if (tempHeight) newConfig.height = tempHeight;

        updateComponentConfig(newConfig);
        
        tempWidth = null;
        tempHeight = null;
    }
</script>

{#key resolvedValue}
    <div class="image-container" in:fade>
        {#if resolvedValue.type === 'string' && !errorLoadingImage}
            {#if !imageLoaded}
                <Skeleton style="flex: 1; width: 100%; height: 100%; min-height: 133px; border-radius: var(--scribe-radius-2xl);" />
            {/if}
            <div 
                class="image-wrapper" 
                class:hidden={!imageLoaded} 
                class:is-dragging={isDragging} 
                bind:this={containerRef} 
                style:width={tempWidth || config?.width || '100%'} 
                style:height={tempHeight || config?.height || 'auto'}
            >
                <img style={style} onload={() => imageLoaded = true} onerror={() => errorLoadingImage = true} id={componentData.id} {src} alt={componentData.id} />   
                
                {#if mode === 'edit'}
                    <div role="separator" aria-orientation="horizontal" class="resize-handle right" onpointerdown={(e) => onPointerDown(e, 'width')} onpointermove={onPointerMove} onpointerup={onPointerUp}></div>
                    <div role="separator" aria-orientation="vertical" class="resize-handle bottom" onpointerdown={(e) => onPointerDown(e, 'height')} onpointermove={onPointerMove} onpointerup={onPointerUp}></div>
                    <div role="separator" class="resize-handle bottom-right" onpointerdown={(e) => onPointerDown(e, 'both')} onpointermove={onPointerMove} onpointerup={onPointerUp}></div>
                {/if}
            </div>
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
    .hidden {
        display: none !important;
    }

    .image-container {
        flex: 1;
        overflow: hidden;
        min-height: 133px;
        border-radius: var(--scribe-radius-2xl);
        padding: 0.25rem;
        align-items: center;
        display: flex;
        justify-content: center;
    }

    .image-wrapper {
        position: relative;
        display: inline-flex;
        max-width: 100%;
        border-radius: var(--scribe-radius-2xl);
    }

    .image-wrapper img {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        aspect-ratio: initial;
    }

    /* Resize handles */
    .resize-handle {
        position: absolute;
        background-color: var(--scribe-primary);
        border: 1px solid var(--scribe-doc-background);
        opacity: 0;
        transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
        z-index: 10;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        touch-action: none; /* Prevent touch scrolling while dragging */
    }

    .image-wrapper:hover .resize-handle,
    .image-wrapper.is-dragging .resize-handle {
        opacity: 1;
    }

    .resize-handle:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }

    .resize-handle.right {
        top: 50%;
        right: -3px;
        margin-top: -12px;
        width: 6px;
        height: 24px;
        border-radius: 3px;
        cursor: ew-resize;
    }

    .resize-handle.bottom {
        bottom: -3px;
        left: 50%;
        margin-left: -12px;
        width: 24px;
        height: 6px;
        border-radius: 3px;
        cursor: ns-resize;
    }

    .resize-handle.bottom-right {
        bottom: -5px;
        right: -5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        cursor: nwse-resize;
    }
</style>
