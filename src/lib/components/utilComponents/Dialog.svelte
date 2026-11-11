<script lang="ts">
	import { Dialog as BitsDialog } from "bits-ui";
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import { getContext } from 'svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	export interface DialogProps {
        children?: Snippet<[]>;
        footer?: Snippet<[]>;
        title: string;
        description?: string;
        open: boolean;
        showCloseButton?: boolean;
	}

    let {
        children,
        footer,
        title,
        description,
        showCloseButton = true,
        open = $bindable(),
    }: DialogProps = $props();

    const i18n = getI18n();
    const getPortalTarget = getContext<() => HTMLElement | null>('scribe-portal-target');
	const portalTarget = $derived(getPortalTarget?.() || undefined);
</script>

<BitsDialog.Root bind:open>
  <BitsDialog.Portal to={portalTarget}>
    <BitsDialog.Overlay class="scribe-dialog-overlay" />
    <BitsDialog.Content class="scribe-dialog-content">
      <header class="scribe-dialog-header">
        <div class="scribe-dialog-heading">
          <BitsDialog.Title class="scribe-dialog-title">{title}</BitsDialog.Title>
          {#if description}
            <BitsDialog.Description class="scribe-dialog-description">
              {description}
            </BitsDialog.Description>
          {/if}
        </div>

        {#if showCloseButton}
          <BitsDialog.Close>
            {#snippet child({props})}
              <Button {...props} variant="ghost" size="icon-sm" class="scribe-dialog-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                <span class="close-txt">{i18n.t('common.close')}</span>
              </Button>
            {/snippet}
          </BitsDialog.Close>
        {/if}
      </header>

      {#if children}
        <div class="scribe-dialog-body">
            {@render children()}
        </div>
      {/if}

      {#if footer}
        <div class="scribe-dialog-footer">
            {@render footer()}
        </div>
      {/if}
    </BitsDialog.Content>
  </BitsDialog.Portal>
</BitsDialog.Root>

<style>
  .close-txt {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border-width: 0;
  }

  :global(.scribe-dialog-overlay) {
    position: fixed;
    inset: 0;
    z-index: 50;
    background-color: var(--scribe-overlay);
    animation: scribe-dialog-fade 160ms ease-out;
  }

  :global(.scribe-dialog-content) {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    width: calc(100% - 2rem);
    max-width: 520px;
    max-height: calc(100vh - 4rem);
    background-color: var(--scribe-popover);
    color: var(--scribe-popover-foreground);
    font-family: var(--scribe-font-sans);
    border: 1px solid var(--scribe-border-color);
    border-radius: var(--scribe-radius-2xl);
    box-shadow: var(--scribe-shadow-float);
    outline: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: scribe-dialog-in 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.scribe-dialog-header) {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.25rem 1rem 1.5rem;
  }

  :global(.scribe-dialog-heading) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  :global(.scribe-dialog-title) {
    font-family: var(--scribe-font-heading);
    font-size: var(--scribe-font-size-lg);
    font-weight: var(--scribe-font-weight-semibold);
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--scribe-popover-foreground);
    margin: 0;
    text-wrap: balance;
  }

  :global(.scribe-dialog-description) {
    font-size: var(--scribe-font-size-sm);
    line-height: 1.45;
    color: var(--scribe-muted-foreground);
    margin: 0;
  }

  :global(.scribe-dialog-close-btn) {
    flex: none;
    margin-top: -0.125rem;
  }

  :global(.scribe-dialog-body) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding: 0.25rem 1.5rem 1.5rem;
  }

  :global(.scribe-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-top: 1px solid var(--scribe-border-color);
    background-color: var(--scribe-muted);
  }

  @keyframes scribe-dialog-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scribe-dialog-in {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.98); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
</style>
