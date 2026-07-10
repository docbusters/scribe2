<script lang="ts">
  import { Select, type WithoutChildren } from "bits-ui";

  type Props = WithoutChildren<Select.RootProps> & {
    id?: string;
    placeholder?: string;
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
    placeholder,
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
    <Select.Trigger {id} class="scribe-select-trigger {error ? 'error' : ''} {placeholder !== undefined ? 'has-placeholder' : 'no-placeholder'}">
      {#if placeholder}
        <label for={id} class="scribe-select-label {value || open ? 'active' : 'idle'}">
          {placeholder}
        </label>
      {/if}
      <span class="scribe-select-value {placeholder !== undefined ? 'with-placeholder' : 'without-placeholder'}">
        {triggerContent}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="scribe-select-chevron"><path d="m6 9 6 6 6-6"/></svg>
    </Select.Trigger>
    <Select.Content sideOffset={10} class="scribe-select-content" {...contentProps}>
      <Select.ScrollUpButton class="scribe-select-scroll-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </Select.ScrollUpButton>
      <Select.Viewport class="scribe-select-viewport">
        {#each items as { value: itemValue, label, disabled } (itemValue)}
          <Select.Item class="scribe-select-item" value={itemValue} {label} {disabled}>
            {#snippet children({ selected })}
              {label}
              {#if selected}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
              {/if}    
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>
      <Select.ScrollDownButton class="scribe-select-scroll-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Root>
  {#if error}
    <div class="scribe-select-error-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <p class="scribe-select-error-text">{error}</p>
    </div>
  {/if}
</div>

<style>
  :global(.scribe-select-container) {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 3.1875rem;
  }

  :global(.scribe-select-trigger) {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    width: 100%;
    background-color: var(--scribe-doc-background);
    border: 1px solid var(--scribe-border-color);
    border-radius: var(--scribe-radius-md);
    font-family: var(--scribe-font-sans);
    color: var(--scribe-doc-foreground);
    cursor: pointer;
    user-select: none;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0;
  }

  :global(.scribe-select-trigger.has-placeholder) {
    min-height: 3.1875rem;
    max-height: 3.1875rem;
    padding-top: 0.875rem;
  }

  :global(.scribe-select-trigger.no-placeholder) {
    min-height: 2.25rem;
    max-height: 2.25rem;
    padding-top: 0.625rem;
  }

  :global(.scribe-select-trigger.error) {
    border-color: var(--scribe-error);
    background-color: oklch(from var(--scribe-error-foreground) l c h / 5%);
  }

  :global(.scribe-select-label) {
    color: var(--scribe-muted-foreground);
    pointer-events: none;
    position: absolute;
    left: 0.5rem;
    user-select: none;
    transition: all 0.3s ease;
  }

  :global(.scribe-select-label.idle) {
    top: 0.75rem;
    font-size: 1rem;
  }

  :global(.scribe-select-label.active) {
    top: 0.25rem;
    font-size: 0.75rem;
  }

  :global(.scribe-select-value) {
    font-size: 1rem;
    color: var(--scribe-doc-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: absolute;
    left: 0.5rem;
    right: 2.25rem;
    text-align: left;
    transition: all 0.3s ease;
  }

  :global(.scribe-select-value.with-placeholder) {
    top: 1.25rem;
  }

  :global(.scribe-select-value.without-placeholder) {
    top: 0.25rem;
  }

  :global(.scribe-select-chevron) {
    color: var(--scribe-muted-foreground);
    transition: transform 0.2s ease;
    margin-top: 0.125rem;
  }

  :global(.scribe-select-content) {
    min-width: var(--bits-select-anchor-width);
    max-height: 300px;
    padding: 0.375rem 0.25rem;
    background-color: var(--scribe-popover);
    border: 1px solid var(--scribe-border-color);
    border-radius: var(--scribe-radius-xl);
    box-shadow: var(--scribe-shadow-lg);
    outline: none;
    z-index: 100;
  }

  :global(.scribe-select-viewport) {
    padding: 0.25rem;
  }

  :global(.scribe-select-item) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 2.5rem;
    padding: 0rem 0.5rem;
    font-family: var(--scribe-font-sans);
    font-size: var(--scribe-font-size-sm);
    font-weight: var(--scribe-font-weight-regular);
    color: var(--scribe-doc-foreground);
    border-radius: var(--scribe-radius-md);
    cursor: pointer;
    user-select: none;
    outline: none;
    transition: background-color 0.15s ease;
  }

  :global(.scribe-select-item[data-highlighted]) {
    background-color: var(--scribe-muted);
  }

  :global(.scribe-select-item[data-disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :global(.scribe-select-scroll-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    color: var(--scribe-muted-foreground);
    background-color: var(--scribe-popover);
    cursor: default;
  }

  :global(.scribe-select-error-container) {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    height: 1.25rem;
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    color: var(--scribe-error);
  }

  :global(.scribe-select-error-text) {
    font-size: 0.75rem;
    margin: 0;
  }
</style>
