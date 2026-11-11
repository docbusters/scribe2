<script lang="ts">
  import { Select, type WithoutChildren } from "bits-ui";

  type Props = WithoutChildren<Select.RootProps> & {
    id?: string;
    /** Text drawn above the field. */
    label?: string;
    items: { value: string; label: string; disabled?: boolean }[];
    contentProps?: WithoutChildren<Select.ContentProps>;
    error?: string | null;
    class?: string;
  };

  let {
    id = `select-input-${crypto.randomUUID()}`,
    value = $bindable(),
    items = [],
    contentProps,
    label,
    error = $bindable(null),
    class: className = '',
    onValueChange,
    ...restProps
  }: Props = $props();

  let open = $state(false);

  const triggerContent = $derived(
    items.find((f) => f.value === value)?.label ?? ''
  );
</script>

<div class="scribe-select-container {className}">
  {#if label}
    <label for={id} class="scribe-select-label">{label}</label>
  {/if}
  <Select.Root
    bind:value={value as never}
    bind:open
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChange={(v: any) => {
      onValueChange?.(v);
      error = null;
    }}
    {...restProps}
  >
    <Select.Trigger {id} class="scribe-select-trigger {error ? 'error' : ''}">
      <span class="scribe-select-value">{triggerContent}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="scribe-select-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </Select.Trigger>
    <Select.Content sideOffset={6} class="scribe-select-content" {...contentProps}>
      <Select.ScrollUpButton class="scribe-select-scroll-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
      </Select.ScrollUpButton>
      <Select.Viewport class="scribe-select-viewport">
        {#each items as { value: itemValue, label: itemLabel, disabled } (itemValue)}
          <Select.Item class="scribe-select-item" value={itemValue} label={itemLabel} {disabled}>
            {#snippet children({ selected })}
              {itemLabel}
              {#if selected}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
              {/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>
      <Select.ScrollDownButton class="scribe-select-scroll-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Root>
  {#if error}
    <div class="scribe-select-error-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="scribe-select-error-icon" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <p class="scribe-select-error-text">{error}</p>
    </div>
  {/if}
</div>

<style>
  :global(.scribe-select-container) {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
  }

  :global(.scribe-select-label) {
    font-size: var(--scribe-font-size-xs);
    font-weight: var(--scribe-font-weight-medium);
    line-height: 1.2;
    color: var(--scribe-secondary-foreground);
  }

  /* Two classes: the reset in scribe.css sets padding and font on `.scribe-document button` (0,1,1) */
  :global(.scribe-select-trigger.scribe-select-trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    height: 2.375rem;
    padding: 0 0.625rem 0 0.75rem;
    background-color: var(--scribe-section-background);
    border: 1px solid var(--scribe-border-strong);
    border-radius: var(--scribe-radius-md);
    font-family: var(--scribe-font-sans);
    font-size: var(--scribe-font-size-sm);
    color: var(--scribe-doc-foreground);
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    transition: border-color 150ms ease-out, background-color 150ms ease-out;
  }

  :global(.scribe-select-trigger:hover) {
    border-color: color-mix(in oklab, var(--scribe-doc-foreground) 38%, var(--scribe-section-background));
  }

  :global(.scribe-select-trigger[data-state='open']) {
    border-color: var(--scribe-accent);
  }

  :global(.scribe-select-trigger.error) {
    border-color: var(--scribe-error-foreground);
    background-color: var(--scribe-error-wash);
  }

  :global(.scribe-select-value) {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  :global(.scribe-select-chevron) {
    flex: none;
    color: var(--scribe-muted-foreground);
  }

  :global(.scribe-select-content) {
    min-width: var(--bits-select-anchor-width);
    max-height: 300px;
    padding: 0.25rem;
    background-color: var(--scribe-popover);
    border: 1px solid var(--scribe-border-color);
    border-radius: var(--scribe-radius-xl);
    box-shadow: var(--scribe-shadow-float);
    outline: none;
    z-index: 100;
  }

  :global(.scribe-select-viewport) {
    padding: 0;
  }

  :global(.scribe-select-item) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 0.625rem;
    font-family: var(--scribe-font-sans);
    font-size: var(--scribe-font-size-sm);
    font-weight: var(--scribe-font-weight-regular);
    color: var(--scribe-popover-foreground);
    border-radius: var(--scribe-radius-md);
    cursor: pointer;
    user-select: none;
    outline: none;
  }

  :global(.scribe-select-item[data-highlighted]) {
    background-color: var(--scribe-muted);
  }

  :global(.scribe-select-item[data-selected]) {
    font-weight: var(--scribe-font-weight-semibold);
  }

  :global(.scribe-select-item[data-disabled]) {
    opacity: 0.45;
    cursor: not-allowed;
  }

  :global(.scribe-select-scroll-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    color: var(--scribe-muted-foreground);
    cursor: default;
  }

  :global(.scribe-select-error-container) {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--scribe-error-foreground);
  }

  :global(.scribe-select-error-icon) {
    flex-shrink: 0;
  }

  :global(.scribe-select-error-text) {
    font-size: var(--scribe-font-size-xs);
    margin: 0;
    color: var(--scribe-error-foreground);
    font-weight: var(--scribe-font-weight-medium);
    line-height: 1.25;
  }
</style>
