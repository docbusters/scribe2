<script lang="ts">
	import { Button } from "bits-ui";
	import type { HTMLButtonAttributes } from "svelte/elements";

  export interface ButtonProps extends HTMLButtonAttributes {
    variant?: "default" | "secondary" | "soft" | "ghost" | "destructive" | "outline" | "ghost-destructive";
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
    loading?: boolean;
  }

  let { children, class: className = "", variant = "default", size = "default", loading = false, disabled, ...restProps }: ButtonProps = $props();
</script>

<Button.Root
  class="scribe-btn scribe-btn-{variant} scribe-btn-size-{size} {className}"
  disabled={loading || disabled}
  {...restProps}
>
  {@render children?.()}
  {#if loading}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="scribe-btn-loading" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  {/if}
</Button.Root>

<style>
  /* Properties that the scoped reset in scribe.css also sets (padding, font, colour) live in
     two-class selectors, so the reset's `.scribe-document button` cannot override them. */
  :global(.scribe-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    border: 1px solid transparent;
    border-radius: var(--scribe-radius-md);
    cursor: pointer;
    box-sizing: border-box;
    white-space: nowrap;
    user-select: none;
    transition: background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out, transform 150ms ease-out;
  }

  :global(.scribe-btn:active:not(:disabled)) {
    transform: scale(0.98);
  }

  :global(.scribe-btn:disabled) {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Sizes */
  :global(.scribe-btn.scribe-btn-size-default) { height: 2.25rem; padding: 0 0.875rem; font-size: var(--scribe-font-size-sm); font-weight: var(--scribe-font-weight-medium); line-height: 1; }
  :global(.scribe-btn.scribe-btn-size-sm) { height: 2rem; padding: 0 0.625rem; font-size: var(--scribe-font-size-sm); font-weight: var(--scribe-font-weight-medium); line-height: 1; border-radius: var(--scribe-radius-md); }
  :global(.scribe-btn.scribe-btn-size-lg) { height: 2.5rem; padding: 0 1.25rem; font-size: var(--scribe-font-size-md); font-weight: var(--scribe-font-weight-medium); line-height: 1; }
  :global(.scribe-btn.scribe-btn-size-icon) { height: 2.25rem; width: 2.25rem; padding: 0; line-height: 1; }
  :global(.scribe-btn.scribe-btn-size-icon-sm) { height: 1.75rem; width: 1.75rem; padding: 0; line-height: 1; border-radius: var(--scribe-radius-sm); }

  /* Variants */
  :global(.scribe-btn.scribe-btn-default) {
    background-color: var(--scribe-primary);
    color: var(--scribe-primary-foreground);
  }
  :global(.scribe-btn.scribe-btn-default:hover:not(:disabled)) {
    background-color: color-mix(in oklab, var(--scribe-primary) 86%, var(--scribe-section-background));
  }

  :global(.scribe-btn.scribe-btn-outline) {
    background-color: var(--scribe-section-background);
    color: var(--scribe-doc-foreground);
    border-color: var(--scribe-border-color);
    box-shadow: var(--scribe-shadow-sm);
  }
  :global(.scribe-btn.scribe-btn-outline:hover:not(:disabled)) {
    background-color: var(--scribe-muted);
    border-color: var(--scribe-border-strong);
  }

  :global(.scribe-btn.scribe-btn-secondary) {
    background-color: var(--scribe-secondary);
    color: var(--scribe-secondary-foreground);
  }
  :global(.scribe-btn.scribe-btn-secondary:hover:not(:disabled)) {
    background-color: color-mix(in oklab, var(--scribe-secondary) 85%, var(--scribe-doc-foreground));
  }

  /* A chosen toggle: the accent as a wash, not a filled block */
  :global(.scribe-btn.scribe-btn-soft) {
    background-color: var(--scribe-accent-wash);
    color: var(--scribe-accent-text);
    border-color: var(--scribe-accent-soft);
  }
  :global(.scribe-btn.scribe-btn-soft:hover:not(:disabled)) {
    background-color: color-mix(in oklab, var(--scribe-accent) 16%, var(--scribe-section-background));
  }

  :global(.scribe-btn.scribe-btn-ghost) {
    background-color: transparent;
    color: inherit;
  }
  :global(.scribe-btn.scribe-btn-ghost:hover:not(:disabled)) {
    background-color: var(--scribe-muted);
  }

  :global(.scribe-btn.scribe-btn-destructive) {
    background-color: var(--scribe-error);
    color: var(--scribe-on-error);
  }
  :global(.scribe-btn.scribe-btn-destructive:hover:not(:disabled)) {
    background-color: color-mix(in oklab, var(--scribe-error) 88%, var(--scribe-doc-foreground));
  }

  :global(.scribe-btn.scribe-btn-ghost-destructive) {
    background-color: transparent;
    color: var(--scribe-muted-foreground);
  }
  :global(.scribe-btn.scribe-btn-ghost-destructive:hover:not(:disabled)) {
    background-color: var(--scribe-error-wash);
    color: var(--scribe-error-foreground);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .scribe-btn-loading {
    animation: spin 1s linear infinite;
  }
</style>
