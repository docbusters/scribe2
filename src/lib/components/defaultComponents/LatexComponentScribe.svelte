<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */ // There is no risk of XSS since katex handles the rendering
    import katex from 'katex';
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { LatexComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import { fade } from 'svelte/transition';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import { valueDialogStore } from '$lib/stores/value-dialog-store.svelte.js';

    let { componentData, sectionId, mode, resolvedValue }: ScribeComponentProps<LatexComponent> = $props();
    const i18n = getI18n();


    const value = $derived(resolvedValue.value as string);
    const config = $derived(componentData.config);

    function renderFormula(latex: string) {
        if (!latex) return '';
        
        try {
            return katex.renderToString(latex, {
                displayMode: true,
                throwOnError: true,
                strict: true,
                errorColor: 'var(--scribe-error-foreground)'
            });
        } catch {
            return null;
        }
    }
</script>

<!-- Necessary styles for KaTeX. The version (and its integrity hash) must match the katex package bundled in package.json -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.5/dist/katex.css" integrity="sha384-zfuvpaZ3OjmRVaLPkCCrb0YbSTd5NgPmLIum+Cmsr06+WhmECuyum4BEipwHyWW4" crossorigin="anonymous">

{#key value}
    <div class="latex-container" in:fade>
        {#if value}
            {@const rendered = renderFormula(value)}
            {#if rendered !== null}
                <div class="latex-expression">
                    {@html rendered}
                </div>
            {:else}
                <EmptyContent
                    action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.changeValue'))}
                    message={config?.errorText || i18n.t('errors.latexUnrecognised')}
                    icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;error-svg lucide lucide-calculator-icon lucide-calculator&quot;><rect width=&quot;16&quot; height=&quot;20&quot; x=&quot;4&quot; y=&quot;2&quot; rx=&quot;2&quot;/><line x1=&quot;8&quot; x2=&quot;16&quot; y1=&quot;6&quot; y2=&quot;6&quot;/><line x1=&quot;16&quot; x2=&quot;16&quot; y1=&quot;14&quot; y2=&quot;18&quot;/><path d=&quot;M16 10h.01&quot;/><path d=&quot;M12 10h.01&quot;/><path d=&quot;M8 10h.01&quot;/><path d=&quot;M12 14h.01&quot;/><path d=&quot;M8 14h.01&quot;/><path d=&quot;M12 18h.01&quot;/><path d=&quot;M8 18h.01&quot;/></svg>"
                    valueStyle="font-family: var(--scribe-font-mono);"
                    description={value}
                    isError
                />
            {/if}
        {:else}
            <EmptyContent
                action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.setValue'))}
                message={config?.emptyText || i18n.t('errors.latexEmpty')}
                icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;error-svg lucide lucide-calculator-icon lucide-calculator&quot;><rect width=&quot;16&quot; height=&quot;20&quot; x=&quot;4&quot; y=&quot;2&quot; rx=&quot;2&quot;/><line x1=&quot;8&quot; x2=&quot;16&quot; y1=&quot;6&quot; y2=&quot;6&quot;/><line x1=&quot;16&quot; x2=&quot;16&quot; y1=&quot;14&quot; y2=&quot;18&quot;/><path d=&quot;M16 10h.01&quot;/><path d=&quot;M12 10h.01&quot;/><path d=&quot;M8 10h.01&quot;/><path d=&quot;M12 14h.01&quot;/><path d=&quot;M8 14h.01&quot;/><path d=&quot;M12 18h.01&quot;/><path d=&quot;M8 18h.01&quot;/></svg>"
            />
        {/if}
    </div>
{/key}

<style>
    .latex-container {
        width: 100%;
        min-height: 1.5em;
        padding: 0.25rem;
        border-radius: var(--scribe-radius-lg);
        display: flex;
        overflow: auto;
        align-items: center;
    }

    /* Centred with auto margins and not justify-content: when the formula is wider than the container, it starts at the
       left edge, so scrolling reaches all of it */
    .latex-expression {
        padding: 0.5rem 1rem;
        margin-inline: auto;
    }
</style>
