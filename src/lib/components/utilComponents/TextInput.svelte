<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import Button from './Button.svelte';

    interface TextInputProps extends HTMLInputAttributes {
        value?: string;
        error?: string | null;
        /** Text drawn above the field. */
        label?: string;
    }

    let {
        value = $bindable(),
        label,
        id = `text-input-${crypto.randomUUID()}`,
        class: className = '',
        error = $bindable(null),
        type: realType,
        oninput,
        ...restProps
    }: TextInputProps = $props();

    let isPasswordVisible = $state(false);

    const type = $derived(realType === 'password' && isPasswordVisible ? 'text' : realType);
</script>

<div data-testid={`container-${id}-input`} class="scribe-input-container {className}">
    {#if label}
        <label for={id} class="scribe-input-label">{label}</label>
    {/if}
    <div class="scribe-input-wrapper {error ? 'error' : ''}">
        <input
            {id}
            {...restProps}
            {...{ type }}
            bind:value={value}
            oninput={(e) => {
                error = null;
                oninput?.(e);
            }}
            aria-invalid={error ? true : undefined}
            class="scribe-input {realType === 'password' ? 'has-password-toggle' : ''}"
        />
        {#if realType === 'password'}
            <Button size="icon-sm" variant="ghost" class="scribe-input-password-toggle" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'} onclick={() => (isPasswordVisible = !isPasswordVisible)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    {#if isPasswordVisible}
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                    {:else}
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/>
                    {/if}
                </svg>
            </Button>
        {/if}
    </div>
    {#if error}
        <div data-testid="input-error-container" class="scribe-input-error-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="scribe-input-error-icon" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p data-testid="input-error" class="scribe-input-error-text">{error}</p>
        </div>
    {/if}
</div>

<style>
  .scribe-input-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
    box-sizing: border-box;
  }

  .scribe-input-label {
    font-size: var(--scribe-font-size-xs);
    font-weight: var(--scribe-font-weight-medium);
    line-height: 1.2;
    color: var(--scribe-secondary-foreground);
  }

  .scribe-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    height: 2.375rem;
    border: 1px solid var(--scribe-border-strong);
    background-color: var(--scribe-section-background);
    border-radius: var(--scribe-radius-md);
    transition: border-color 150ms ease-out, background-color 150ms ease-out;
    box-sizing: border-box;
  }

  .scribe-input-wrapper:hover {
    border-color: color-mix(in oklab, var(--scribe-doc-foreground) 38%, var(--scribe-section-background));
  }

  .scribe-input-wrapper:focus-within {
    border-color: var(--scribe-accent);
    outline: 1px solid var(--scribe-accent);
  }

  .scribe-input-wrapper.error {
    border-color: var(--scribe-error-foreground);
    background-color: var(--scribe-error-wash);
  }

  .scribe-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 0.75rem;
    font-size: var(--scribe-font-size-sm);
    color: var(--scribe-doc-foreground);
    background: transparent;
    border: none;
    border-radius: var(--scribe-radius-md);
    outline: none;
    box-sizing: border-box;
  }

  .scribe-input.scribe-input:focus-visible {
    outline: none;
  }

  .scribe-input::placeholder {
    color: var(--scribe-muted-foreground);
  }

  .scribe-input.has-password-toggle {
    padding-right: 2.5rem;
  }

  :global(.scribe-input-password-toggle) {
    position: absolute;
    right: 0.25rem;
    color: var(--scribe-muted-foreground);
  }

  .scribe-input-error-container {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--scribe-error-foreground);
  }

  .scribe-input-error-icon {
    flex-shrink: 0;
  }

  .scribe-input-error-text {
    font-size: var(--scribe-font-size-xs);
    margin: 0;
    color: var(--scribe-error-foreground);
    font-weight: var(--scribe-font-weight-medium);
    line-height: 1.25;
  }
</style>
