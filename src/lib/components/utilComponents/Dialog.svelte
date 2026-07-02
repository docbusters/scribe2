<script lang="ts">
	import { Dialog as BitsDialog } from "bits-ui";
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import { getContext } from 'svelte';

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

    const getPortalTarget = getContext<() => HTMLElement | null>('scribe-portal-target');
	const portalTarget = $derived(getPortalTarget?.() || undefined);
</script>

<BitsDialog.Root bind:open>
  <BitsDialog.Portal to={portalTarget}>
    <BitsDialog.Overlay class="scribe-dialog-overlay" />
    <BitsDialog.Content class="scribe-dialog-content">
      <BitsDialog.Title class="scribe-dialog-title">{title}</BitsDialog.Title>
      
      {#if showCloseButton}
        <BitsDialog.Close>
          {#snippet child({props})}
            <Button {...props} variant="ghost" size="icon" class="scribe-dialog-close-btn" style="border-radius: 100%;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              <span class="close-txt">Close</span>
            </Button>
          {/snippet}
        </BitsDialog.Close>
      {/if}
      
      {#if description}
      <BitsDialog.Description class="scribe-dialog-description">
        {description}
      </BitsDialog.Description>
      {/if}
      
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
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	:global(.scribe-document .scribe-dialog-content) {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 50;
		width: calc(100% - 2rem);
		max-width: 490px;
		max-height: calc(100vh - 4rem);
		padding: 1.5rem;
    padding-right: 0.5rem;
		background-color: var(--scribe-popover);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-xl);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		outline: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.scribe-document .scribe-dialog-title) {
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-lg);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
		margin: 0;
		text-align: center;
	}

	:global(.scribe-document .scribe-dialog-description) {
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-muted-foreground);
		margin: 0;
		text-align: center;
	}

	:global(.scribe-document .scribe-dialog-close-btn) {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

  :global(.scribe-document .scribe-dialog-body) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding: 0.125rem;
    padding-right: 1rem;
  }

  :global(.scribe-document .scribe-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-right: 1rem;
  }
</style>
