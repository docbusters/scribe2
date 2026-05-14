<svelte:options customElement={{
    props: {
        variant: { type: 'String' },
        size: { type: 'String' }
    }
}} />

<script lang="ts">
	import { Button } from "bits-ui";
	import type { HTMLButtonAttributes } from "svelte/elements";

  interface ButtonProps extends HTMLButtonAttributes {
    variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  }

  let { children, style = "", class: className = "", variant = "default", size = "default", ...restProps }: ButtonProps = $props();

  const variantStyles: Record<string, string> = {
    default: "background-color: var(--scribe-primary); color: var(--scribe-primary-foreground); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);",
    destructive: "background-color: var(--scribe-error); color: white; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);",
    outline: "background-color: var(--scribe-doc-background); color: var(--scribe-doc-foreground); border: 1px solid var(--scribe-border-color); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);",
    secondary: "background-color: var(--scribe-secondary); color: var(--scribe-secondary-foreground); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);",
    ghost: "background-color: transparent; color: inherit; box-shadow: none;",
  };

  const sizeStyles: Record<string, string> = {
    default: "height: 2.25rem; padding: 0.5rem 1rem;",
    sm: "height: 2rem; padding: 0 0.75rem; border-radius: 0.375rem; gap: 0.375rem;",
    lg: "height: 2.5rem; padding: 0 1.5rem; border-radius: 0.375rem;",
    icon: "height: 2.25rem; width: 2.25rem; padding: 0;",
    "icon-sm": "height: 1.5rem; width: 1.5rem; padding: 0;",
  };

  const mergedStyle = $derived(`${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.default} ${style}`);
</script>

<Button.Root
  style={mergedStyle}
  class="scribe-btn {className}"
  {...restProps}
>
  {@render children?.()}
</Button.Root>

<style>
  :global(.scribe-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius, 0.5rem);
    transition: all 0.2s ease;
    cursor: pointer;
    box-sizing: border-box;
    white-space: nowrap;
    outline: none;
    border: none;
  }

  :global(.scribe-btn:active) {
    transform: scale(0.98);
  }

  :global(.scribe-btn:hover) {
    opacity: 0.9;
  }

  :global(.scribe-btn[style*="border:"]) {
    border-color: var(--border, #e5e7eb);
  }
  :global(.scribe-btn[style*="border:"]:hover), :global(.scribe-btn[style*="transparent"]:not([style*="underline"]):hover) {
    background-color: var(--accent, #f1f5f9) !important;
    color: var(--accent-foreground, #0f172a) !important;
  }
</style>
