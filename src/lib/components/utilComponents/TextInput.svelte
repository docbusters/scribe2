<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import Button from './Button.svelte';

    interface TextInputProps extends HTMLInputAttributes {
        value?: string;
        error?: string | null;
    }

    let {
        value = $bindable(),
        placeholder,
        id = `text-input-${crypto.randomUUID()}`,
        class: className = '',
        error = $bindable(null),
        type: realType,
        oninput,
        ...restProps
    }: TextInputProps = $props();

    let isFocused = $state(false);
    let isPasswordVisible = $state(false);

    const type = $derived(realType === 'password' && isPasswordVisible ? 'text' : realType);

    function togglePassword() {
        isPasswordVisible = !isPasswordVisible;
    }
</script>

<div data-testid={`container-${id}-input`} class="scribe-input-container {className}">
    <div class="scribe-input-wrapper {error ? 'error' : ''}">
        {#if placeholder}
            <label for={id} class="scribe-input-label {(value !== undefined && value !== null && value !== '') || isFocused ? 'active' : 'idle'}">
                {placeholder}
            </label>
        {/if}
        <input
            {id}
            {...restProps}
            {...{ type }}
            bind:value={value}
            oninput={(e) => {
                error = null;
                oninput?.(e);
            }}
            onfocus={() => isFocused = true}
            onblur={() => isFocused = false}
            class="scribe-input {realType === 'password' ? 'has-password-toggle' : ''} {!placeholder ? 'no-placeholder' : ''}"
        />
        {#if realType === 'password'}
            <Button size="icon" variant="ghost" class="scribe-input-password-toggle" onclick={togglePassword}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="scribe-input-eye scribe-input-eye-off {isPasswordVisible ? 'scribe-input-eye-active' : 'scribe-input-eye-inactive'}"
                >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="scribe-input-eye scribe-input-eye-on {!isPasswordVisible ? 'scribe-input-eye-active' : 'scribe-input-eye-inactive'}"
                >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/>
                </svg>
            </Button>
        {/if}
    </div>
    {#if error}
        <div data-testid="input-error-container" class="scribe-input-error-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="scribe-input-error-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p data-testid="input-error" class="scribe-input-error-text" style="color: var(--scribe-error-foreground, #dc2626) !important;">{error}</p>
        </div>
    {/if}
</div>

<style>
  .scribe-input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  .scribe-input-wrapper {
    min-height: 3.1875rem;
    max-height: 3.1875rem;
    height: 3.1875rem;
    position: relative;
    border: 1px solid var(--scribe-border-color);
    background-color: var(--scribe-popover);
    border-radius: var(--scribe-radius-md);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
  }

  .scribe-input-wrapper.error {
    border-color: var(--scribe-error-foreground, #dc2626) !important;
    background-color: color-mix(in srgb, var(--scribe-error-foreground, #dc2626) 6%, var(--scribe-popover));
  }

  .scribe-input-label {
    color: var(--scribe-muted-foreground);
    pointer-events: none;
    position: absolute;
    cursor: text;
    left: 0.5rem;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    line-height: 1;
    z-index: 1;
  }

  .scribe-input-label.idle {
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
  }

  .scribe-input-label.active {
    top: 0.35rem;
    transform: translateY(0);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .scribe-input {
    border-radius: var(--scribe-radius-md);
    font-size: 1rem;
    color: var(--scribe-doc-foreground) !important;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 1.125rem;
    padding-bottom: 0.125rem;
    height: 100%;
    outline: none;
    border: none;
    background: transparent;
    width: 100%;
    box-sizing: border-box;
  }

  .scribe-input.no-placeholder {
    padding-top: 0;
    padding-bottom: 0;
  }

  .scribe-input.has-password-toggle {
    padding-right: 3rem;
  }

  .scribe-input-password-toggle {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .scribe-input-eye {
    position: absolute;
    color: var(--scribe-muted-foreground);
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .scribe-input-eye-on {
    top: 0.375rem;
  }

  .scribe-input-eye-active {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }

  .scribe-input-eye-inactive {
    opacity: 0;
  }

  .scribe-input-eye-off.scribe-input-eye-inactive {
    transform: rotate(-90deg) scale(0);
  }

  .scribe-input-eye-on.scribe-input-eye-inactive {
    transform: rotate(90deg) scale(0);
  }

  :global(.scribe-document .scribe-input-error-container),
  .scribe-input-error-container {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 1.25rem;
    margin-top: 0.375rem;
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    color: var(--scribe-error-foreground, #dc2626) !important;
  }

  :global(.scribe-document .scribe-input-error-icon),
  .scribe-input-error-icon {
    flex-shrink: 0;
    color: var(--scribe-error-foreground, #dc2626) !important;
  }

  :global(.scribe-document .scribe-input-error-text),
  :global(.scribe-document p.scribe-input-error-text),
  .scribe-input-error-text {
    font-size: 0.75rem;
    margin: 0;
    color: var(--scribe-error-foreground, #dc2626) !important;
    font-weight: 500;
    line-height: 1.25;
  }
</style>
