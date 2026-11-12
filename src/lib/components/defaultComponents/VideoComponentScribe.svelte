<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
    import type { VideoComponent } from '../../domain/components/DefaultComponents.ts';
    import EmptyContent from '../utilComponents/EmptyContent.svelte';
    import { getI18n } from '$lib/i18n/i18n.svelte.js';
    import { selectionStore } from '$lib/stores/selection-store.svelte.js';
    import { valueDialogStore } from '$lib/stores/value-dialog-store.svelte.js';
    import { parseVideoUrl, type VideoProvider } from '$lib/utils/videoEmbed.js';

    // The providers the empty state lists. Names are brand names (not translated), and the colours are theirs: the one exception to
    // the rule of no hard-coded colours, set as `--tile` so the pills follow the tint formula of `.scribe-pill` in both themes
    const PROVIDERS: { id: VideoProvider; name: string; color: string }[] = [
        { id: 'youtube', name: 'YouTube', color: '#ff0000' },
        { id: 'vimeo', name: 'Vimeo', color: '#1ab7ea' },
    ];

    let { componentData, sectionId, mode, resolvedValue }: ScribeComponentProps<VideoComponent> = $props();
    const i18n = getI18n();

    const url = $derived(resolvedValue.type === 'string' ? resolvedValue.value.trim() : '');
    // Null when there is no link, or when it is not one of a supported provider
    const video = $derived(url ? parseVideoUrl(url) : null);

    // An iframe swallows the pointer events, so while the component is not selected a layer on top lets the first click select it
    const isSelected = $derived(mode === 'edit' && selectionStore.isSelected(sectionId, componentData.id));
</script>

<div class="video-container">
    {#if video}
        <!-- The src is built from the id of the video, so it can only be a player of one of the three providers -->
        <iframe
            class="video-frame"
            src={video.embedUrl}
            title={i18n.t('components.video.name')}
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
            loading="lazy"
        ></iframe>
        {#if mode === 'edit' && !isSelected}
            <div class="video-overlay"></div>
        {/if}
    {:else if url}
        <EmptyContent
            action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.changeValue'))}
            message={i18n.t('errors.videoUnsupported')}
            description={url}
            icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-video-off-icon lucide-video-off&quot;><path d=&quot;M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196&quot;/><path d=&quot;M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2&quot;/><path d=&quot;m2 2 20 20&quot;/></svg>"
            isError
        />
    {:else}
        <EmptyContent
            action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.setValue'))}
            message={i18n.t('errors.videoEmpty')}
            icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-square-play-icon lucide-square-play&quot;><rect width=&quot;18&quot; height=&quot;18&quot; x=&quot;3&quot; y=&quot;3&quot; rx=&quot;2&quot;/><path d=&quot;m9 8 6 4-6 4Z&quot;/></svg>"
        >
            <ul class="video-providers" aria-label={i18n.t('components.video.providers')}>
                {#each PROVIDERS as provider (provider.id)}
                    <li class="scribe-pill video-provider" style:--tile={provider.color}>
                        <span class="video-provider-dot" aria-hidden="true"></span>
                        {provider.name}
                    </li>
                {/each}
            </ul>
        </EmptyContent>
    {/if}
</div>

<style>
    .video-container {
        position: relative;
        flex: 1;
        display: flex;
        /* The box of the block gives the height, and the player fills it */
        height: 100%;
        min-height: 0;
        min-width: 0;
        width: 100%;
        overflow: hidden;
        border-radius: var(--scribe-radius-xl);
    }

    .video-frame {
        width: 100%;
        height: 100%;
        border: 0;
        border-radius: inherit;
        background-color: var(--scribe-muted);
    }

    .video-overlay {
        position: absolute;
        inset: 0;
    }

    /* The providers, as a centred row of pills that wraps when the block is narrow */
    .video-providers {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin: 0.25rem 0 0;
        padding: 0;
        list-style: none;
    }

    /* A bit larger than the default pill: the scoped selector has more specificity than the global class */
    .video-provider {
        gap: 0.375rem;
        height: 1.5rem;
        padding: 0 0.625rem;
        font-size: var(--scribe-font-size-xs);
    }

    .video-provider-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: var(--tile);
    }
</style>
