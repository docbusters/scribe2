<script lang="ts">
	import { Button } from "bits-ui";
	import type { HTMLButtonAttributes } from "svelte/elements";

  export interface ButtonProps extends HTMLButtonAttributes {
    variant?: "default" | "secondary" | "ghost" | "destructive" | "outline" | "ghost-destructive";
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
    loading?: boolean;
  }

  let { children, style = "", class: className = "", variant = "default", size = "default", loading = false, disabled, ...restProps }: ButtonProps = $props();

  const variantStyles: Record<string, string> = {
    default: "background-color: var(--scribe-primary); color: var(--scribe-primary-foreground); box-shadow: var(--scribe-shadow-sm);",
    destructive: "background-color: var(--scribe-error); color: white; box-shadow: var(--scribe-shadow-sm);",
    outline: "background-color: transparent; color: var(--scribe-doc-foreground); border: 1px solid var(--scribe-border-color); box-shadow: var(--scribe-shadow-sm);",
    secondary: "background-color: var(--scribe-secondary); color: var(--scribe-secondary-foreground); border: 1px solid var(--scribe-border-color); box-shadow: var(--scribe-shadow-sm);",
    ghost: "background-color: transparent; color: inherit; box-shadow: none;",
    "ghost-destructive": "background-color: transparent; color: var(--scribe-muted-foreground); box-shadow: none;",
  };

  const sizeStyles: Record<string, string> = {
    default: "height: 2.25rem; padding: 0.5rem 1rem;",
    sm: "height: 2rem; padding: 0 0.75rem; border-radius: var(--scribe-radius-sm); gap: 0.375rem;",
    lg: "height: 2.5rem; padding: 0 1.5rem; border-radius: var(--scribe-radius-sm);",
    icon: "min-height: 2.25rem; min-width: 2.25rem; padding: 0;",
    "icon-sm": "height: 1.5rem; width: 1.5rem; padding: 0;",
  };

  const mergedStyle = $derived(`${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${style}`);
</script>

<Button.Root
  style={mergedStyle}
  class="scribe-btn scribe-btn-{variant} {className}"
  disabled={loading || disabled}
  {...restProps}
>
  {@render children?.()}
  {#if loading}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="scribe-btn-loading lucide lucide-loader-circle-icon lucide-loader-circle"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  {/if}
</Button.Root>

<style>
  :global(.scribe-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: var(--scribe-font-weight-semibold);
    border-radius: var(--scribe-radius-md);
    transition: all 0.2s ease;
    cursor: pointer;
    box-sizing: border-box;
    white-space: nowrap;
    outline: none;
    border: none;
  }

  :global(.scribe-btn:active:not(:disabled)) {
    transform: scale(0.98);
  }

  :global(.scribe-btn:hover:not(:disabled)) {
    opacity: 0.9;
  }

  :global(.scribe-btn:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :global(.scribe-btn[style*="border:"]) {
    border-color: var(--scribe-border-color);
  }
  :global(.scribe-btn[style*="border:"]:hover), :global(.scribe-btn[style*="transparent"]:not([style*="underline"]):hover) {
    background-color: var(--scribe-muted) !important;
    color: var(--scribe-muted-foreground) !important;
  }

  :global(.scribe-btn.scribe-btn-ghost-destructive:hover:not(:disabled)) {
    background-color: oklch(from var(--scribe-error-foreground) l c h / 15%) !important;
    color: var(--scribe-error-foreground) !important;
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
