<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
    import { mergeProps, Tooltip } from "bits-ui";
    import { getContext } from "svelte";
    import Button, { type ButtonProps } from "../utilComponents/Button.svelte";
    import { getI18n } from "$lib/i18n/i18n.svelte.js";
    import { getShortcutTokens, isMacPlatform, parseShortcut, toAriaKeyShortcuts } from "$lib/utils/shortcuts.js";

    interface ComponentEditorButtonProps extends Omit<ButtonProps, 'size' | 'variant' | 'style'> {
        icon?: string;
        name: string;
        /** Short text. When present the button is drawn large, with the icon over the text */
        label?: string;
        disabled?: boolean;
        isSelected: boolean;
        /** Shortcut of the option as written in its definition, for example `Mod+B`. It is shown in the tooltip */
        shortcut?: string;
    }

    let { name, icon, label, isSelected, shortcut, ...buttonProps }: ComponentEditorButtonProps = $props();

    const i18n = getI18n();
    const anchorId = $props.id();
    const getPortalTarget = getContext<(() => HTMLElement | null) | undefined>('scribe-portal-target');
    // Inside the Scribe element, so the tooltip gets its theme and tokens. An option that mounts itself has no context and portals to the body
    const portalTarget = $derived(getPortalTarget?.() || undefined);

    // Buttons without a label are square icons, the ones with a label grow with their text
    // The size comes from a variable so a grid of buttons can make them smaller (an inline style cannot be overridden by CSS)
    const SMALL_STYLE = "width: var(--editor-icon-button-size, 2rem); height: var(--editor-icon-button-size, 2rem); min-width: var(--editor-icon-button-size, 2rem); min-height: var(--editor-icon-button-size, 2rem);";
    const LARGE_STYLE = "height: auto; width: auto; min-width: 4rem; min-height: 3.5rem; padding: 0.375rem 0.625rem; flex-direction: column; gap: 0.25rem;";

    const isMac = isMacPlatform();
    const MAC_SYMBOLS: Record<string, string> = { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' };
    const ARROW_SYMBOLS: Record<string, string> = { arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→' };

    /**
     * Where the tooltip points: the button, but as tall as it takes to reach the bottom of the ribbon, so the tooltip drops
     * below the ribbon instead of covering the title of the group. Outside the ribbon it points at the button itself
     */
    const anchor = {
        getBoundingClientRect(): DOMRect {
            const button = document.querySelector(`[data-tooltip-anchor="${anchorId}"]`);
            const rect = button?.getBoundingClientRect() ?? new DOMRect();
            const ribbon = button?.closest('.scribe-top-toolbar');
            if (!ribbon) return rect;
            return new DOMRect(rect.x, rect.y, rect.width, Math.max(rect.bottom, ribbon.getBoundingClientRect().bottom) - rect.y);
        }
    };

    let parsedShortcut = $derived(shortcut ? parseShortcut(shortcut) : null);
    let keys = $derived(parsedShortcut ? getShortcutTokens(parsedShortcut, isMac).map(getKeyText) : []);

    /** The text of a key of the shortcut: a symbol on a Mac, a letter in capitals or its translated name */
    function getKeyText(token: string): string {
        if (isMac && MAC_SYMBOLS[token]) return MAC_SYMBOLS[token];
        if (ARROW_SYMBOLS[token]) return ARROW_SYMBOLS[token];
        return token.length === 1 ? token.toUpperCase() : i18n.t(`shortcuts.keys.${token}`);
    }
</script>

<Tooltip.Provider delayDuration={400}>
    <Tooltip.Root>
        <Tooltip.Trigger>
            {#snippet child({ props })}
                <Button size="icon-sm" variant={isSelected ? "soft" : "ghost"} aria-label={label ? undefined : name} aria-pressed={isSelected || undefined} data-tooltip-anchor={anchorId} aria-keyshortcuts={parsedShortcut ? toAriaKeyShortcuts(parsedShortcut, isMac) : undefined} {...mergeProps(props, buttonProps)} style={label ? LARGE_STYLE : SMALL_STYLE}>
                    {#if label}
                        <span class="large-icon">
                            {#if icon}
                                {@html icon}
                            {/if}
                        </span>
                        <span class="large-label">{label}</span>
                    {:else if icon}
                        {@html icon}
                    {/if}
                </Button>
            {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Portal to={portalTarget}>
            <Tooltip.Content class="scribe-tooltip-content" side="bottom" sideOffset={6} collisionPadding={8} customAnchor={anchor}>
                <Tooltip.Arrow class="scribe-tooltip-arrow" width={10} height={5} />
                <span class="scribe-tooltip-name">{name}</span>
                {#if keys.length > 0}
                    <span class="scribe-tooltip-keys">
                        {#each keys as key, index (index)}
                            <kbd class="scribe-kbd">{key}</kbd>
                        {/each}
                    </span>
                {/if}
            </Tooltip.Content>
        </Tooltip.Portal>
    </Tooltip.Root>
</Tooltip.Provider>

<style>
    .large-icon {
        display: flex;
    }

    .large-icon :global(svg) {
        width: 1.25rem;
        height: 1.25rem;
    }

    .large-label {
        font-size: var(--scribe-font-size-xs);
        font-weight: var(--scribe-font-weight-medium);
        line-height: 1;
    }

    /* The tooltip is portalled out of the button, so its styles are global. Two classes beat the scoped reset of scribe.css.
       The name is the title and the shortcut is a quieter line under it. It is the ink of the document on the section surface (inverted), so it stands out from the white ribbon in both themes */
    :global(.scribe-tooltip-content.scribe-tooltip-content) {
        z-index: 60;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3125rem;
        padding: 0.375rem 0.5rem;
        background-color: var(--scribe-doc-foreground);
        color: var(--scribe-section-background);
        border-radius: var(--scribe-radius-md);
        box-shadow: var(--scribe-shadow-float);
        white-space: nowrap;
        user-select: none;
        pointer-events: none;
        transform-origin: var(--bits-tooltip-content-transform-origin);
    }

    /* The reset sets font and colour on every span, so the text needs two classes to keep the size of the toolbar */
    :global(.scribe-tooltip-content .scribe-tooltip-name) {
        font-family: inherit;
        font-size: var(--scribe-font-size-xs);
        font-weight: var(--scribe-font-weight-medium);
        line-height: 1rem;
        color: inherit;
    }

    :global(.scribe-tooltip-content .scribe-tooltip-keys) {
        display: inline-flex;
        align-items: center;
        gap: 0.1875rem;
    }

    /* Quiet caps over the dark surface, instead of the bordered keys of the forms */
    :global(.scribe-tooltip-content .scribe-kbd) {
        justify-content: center;
        min-width: 1.125rem;
        height: 1.125rem;
        padding: 0 0.25rem;
        border: 0;
        border-radius: var(--scribe-radius-sm);
        background: color-mix(in oklab, var(--scribe-section-background) 16%, transparent);
        color: color-mix(in oklab, var(--scribe-section-background) 75%, transparent);
        font-size: 0.6875rem;
    }

    /* The arrow is a span around the svg. Without these it is as tall as a line of text, which pushes the tooltip away from its anchor */
    :global(.scribe-tooltip-arrow) {
        display: block;
        font-size: 0;
        line-height: 0;
        color: var(--scribe-doc-foreground);
    }

    :global(.scribe-tooltip-content[data-state="delayed-open"]),
    :global(.scribe-tooltip-content[data-state="instant-open"]) {
        animation: scribe-tooltip-in 140ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes scribe-tooltip-in {
        from {
            opacity: 0;
            transform: translateY(-2px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: none;
        }
    }
</style>
