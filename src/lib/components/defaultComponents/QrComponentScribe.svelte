<script lang="ts">
    import type { Action } from 'svelte/action';
    import type { Options } from 'qr-code-styling';
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
    import type { QrComponent } from '../../domain/components/DefaultComponents.ts';
    import type { QrComponentConfig } from '../../domain/components/DefaultComponentsConfig.ts';
    import EmptyContent from '../utilComponents/EmptyContent.svelte';
    import { getI18n } from '$lib/i18n/i18n.svelte.js';
    import { valueDialogStore } from '$lib/stores/value-dialog-store.svelte.js';

    let { componentData, sectionId, mode, resolvedValue }: ScribeComponentProps<QrComponent> = $props();
    const i18n = getI18n();

    const text = $derived(resolvedValue.type === 'string' ? resolvedValue.value.trim() : '');
    // The values of the config are the dot types of the library
    const dotsType = $derived(componentData.config?.dotsType ?? 'square');

    // The library cannot encode the text (it is too long)
    let failed = $state(false);

    // Always black on white, in both themes: a QR that follows the dark theme (light on dark) is not read by many scanners. These literal
    // colours are the exception to the rule of no hard-coded colours. The size is fixed and the SVG is scaled with CSS, and the margin
    // (in the units of that size) is the quiet zone that scanners need around the code
    const QR_OPTIONS: Partial<Options> = {
        type: 'svg',
        shape: 'square',
        width: 300,
        height: 300,
        margin: 32,
        qrOptions: { errorCorrectionLevel: 'Q' },
        dotsOptions: { type: 'square', color: '#000000', roundSize: false },
        cornersSquareOptions: { type: 'square', color: '#000000' },
        cornersDotOptions: { type: 'square', color: '#000000' },
        backgroundOptions: { color: '#ffffff' },
    };

    type QrParams = { data: string; dotsType: NonNullable<QrComponentConfig['dotsType']>; onFailed: (failed: boolean) => void };

    // The part of the library that is used. Its types describe an ES module with a default export, but the package is a CommonJS file that
    // exports the class itself, so the types of the class are not used (see how the module is read below)
    interface QrCode {
        update(options: Partial<Options>): void;
        append(container: HTMLElement): void;
        /** Runs the function with the SVG after every draw, which includes the updates */
        applyExtension(extension: (svg: SVGElement, options: Options) => void): void;
    }
    type QrCodeConstructor = new (options: Partial<Options>) => QrCode;

    /**
     * The library draws every dot as its own shape inside one clipPath and fills a rectangle clipped by it, and the browser anti-aliases
     * each shape on its own: where two dots share an edge that falls between pixels, a thin light line shows between them. Plain shapes
     * with a stroke of the same colour overlap their neighbours, which closes it (a stroke or `shape-rendering` on the children of a
     * clipPath does nothing, so the shapes are moved out of it). Without the structure it expects, it leaves the code as it is
     */
    function closeSeams(svg: SVGElement, options: Options) {
        // Circles only touch at a point, so there is nothing to close, and a stroke would make them bolder
        if (options.dotsOptions?.type === 'dots') return;

        const clipPath = svg.querySelector('clipPath[id^="clip-path-dot-color"]');
        const painted = clipPath && svg.querySelector(`rect[clip-path*="${clipPath.id}"]`);
        if (!clipPath || !painted) return;

        const color = painted.getAttribute('fill') ?? '#000000';
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'qr-dots');
        group.setAttribute('fill', color);
        group.setAttribute('stroke', color);
        group.append(...clipPath.childNodes);
        painted.replaceWith(group);
        clipPath.remove();
    }

    /**
     * Draws the QR code in the node. The library needs the DOM, so it is loaded when the first code is drawn (the bundle includes it, and
     * the import is evaluated only then). It creates the code once and updates it when the text changes
     */
    const qr: Action<HTMLDivElement, QrParams> = (node, initial) => {
        let params = initial;
        let code: QrCode | undefined;
        let destroyed = false;

        async function draw() {
            const module = await import('qr-code-styling');
            // The component went away while the library was loading
            if (destroyed) return;

            // The default export is the class itself once bundled, and the namespace that holds it if a tool keeps the shape of the types
            const exported = module.default as unknown as QrCodeConstructor & { default?: QrCodeConstructor };
            const QRCodeStyling: QrCodeConstructor = exported.default ?? exported;

            // The whole object, so the colour and the other options of the dots never depend on how the library merges the update
            const dotsOptions = { ...QR_OPTIONS.dotsOptions, type: params.dotsType };

            try {
                if (code) {
                    code.update({ data: params.data, dotsOptions });
                } else {
                    code = new QRCodeStyling({ ...QR_OPTIONS, data: params.data, dotsOptions });
                    code.applyExtension(closeSeams);
                    code.append(node);
                }
                params.onFailed(false);
            } catch {
                // The library throws 'code length overflow' when the text does not fit in the largest code
                params.onFailed(true);
            }
        }

        draw();

        return {
            update(next) {
                params = next;
                draw();
            },
            destroy() {
                destroyed = true;
                node.replaceChildren();
            }
        };
    };
</script>

{#if !text}
    <EmptyContent
        action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.setValue'))}
        message={i18n.t('errors.qrEmpty')}
        icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-qr-code-icon lucide-qr-code&quot;><rect width=&quot;5&quot; height=&quot;5&quot; x=&quot;3&quot; y=&quot;3&quot; rx=&quot;1&quot;/><rect width=&quot;5&quot; height=&quot;5&quot; x=&quot;16&quot; y=&quot;3&quot; rx=&quot;1&quot;/><rect width=&quot;5&quot; height=&quot;5&quot; x=&quot;3&quot; y=&quot;16&quot; rx=&quot;1&quot;/><path d=&quot;M21 16h-3a2 2 0 0 0-2 2v3&quot;/><path d=&quot;M21 21v.01&quot;/><path d=&quot;M12 7v3a2 2 0 0 1-2 2H7&quot;/><path d=&quot;M3 12h.01&quot;/><path d=&quot;M12 3h.01&quot;/><path d=&quot;M12 16v.01&quot;/><path d=&quot;M16 12h1&quot;/><path d=&quot;M21 12v.01&quot;/><path d=&quot;M12 21v-1&quot;/></svg>"
    />
{:else}
    <div class="qr-container">
        <!-- The code stays mounted while it fails, so the library keeps its instance: the card is only hidden behind the error -->
        <div
            class="qr-card"
            class:is-hidden={failed}
            role="img"
            aria-label={i18n.t('components.qr.ariaLabel', { value: text })}
            use:qr={{ data: text, dotsType, onFailed: (value) => (failed = value) }}
        ></div>
        {#if failed}
            <EmptyContent
                style="align-self: stretch;"
                action={valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.changeValue'))}
                message={i18n.t('errors.qrTooLong')}
                icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-triangle-alert&quot;><path d=&quot;m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3&quot;/><path d=&quot;M12 9v4&quot;/><path d=&quot;M12 17h.01&quot;/></svg>"
                isError
            />
        {/if}
    </div>
{/if}

<style>
    .qr-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        /* The box of the block gives the height. It is a size container so the card can be the largest square that fits in it */
        container-type: size;
        height: 100%;
        min-height: 0;
        min-width: 0;
        width: 100%;
    }

    .qr-card {
        /* Fixed white, like the code: the card is its quiet zone, and it must not follow the theme */
        background-color: #ffffff;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        box-sizing: border-box;
        overflow: hidden;
        width: min(100cqw, 100cqh);
        height: min(100cqw, 100cqh);
    }

    .qr-card.is-hidden {
        display: none;
    }

    /* The library draws the SVG at its fixed size: it is scaled to the card */
    .qr-card :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }

    /* The stroke that closes the seams between dots (see closeSeams). It is 0.6 screen pixels whatever the scale of the SVG, so each shape grows
       0.3px on each side: enough to overlap its neighbours at any size and pixel ratio, and too little to see. `vector-effect` is not inherited */
    .qr-card :global(.qr-dots > *) {
        vector-effect: non-scaling-stroke;
        stroke-width: 0.6px;
    }
</style>
