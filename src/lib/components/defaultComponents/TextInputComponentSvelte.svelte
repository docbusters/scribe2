<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextInputComponent } from '$lib/domain/components/DefaultComponents.js';
	import { dataStore } from '../../stores/data-store.svelte.js';
    import { navigateToAdjacentComponent } from '$lib/utils/focusNavigation.js';

    let { componentData }: ScribeComponentProps<TextInputComponent> = $props();

    const bindValue = $derived(componentData.value)
    const config = $derived(componentData.config)

    let inputElement: HTMLInputElement | null = $state(null);

    const style = $derived.by(() => {
        let styleString = '';

        if (config?.expandWithContent) {
            styleString += 'field-sizing: content;';
        }

        return styleString;
    });

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
        const target = event.currentTarget;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp': {
                if (target.selectionStart === 0 && target.selectionEnd === 0) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'up');
                }
                break;
            }
            case 'ArrowRight':
            case 'ArrowDown': {
                if (target.selectionStart === target.value.length && target.selectionEnd === target.value.length) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'down');
                }
                break;
            }
        }
    }

    $effect(() => {
        if (!inputElement) return;

        const onFocusStart = (e: Event) => {
            e.preventDefault();
            inputElement!.focus();
            inputElement!.setSelectionRange(0, 0);
        };

        const onFocusEnd = (e: Event) => {
            e.preventDefault();
            inputElement!.focus();
            inputElement!.setSelectionRange(inputElement!.value.length, inputElement!.value.length);
        };

        inputElement.addEventListener('scribe-focus-start', onFocusStart);
        inputElement.addEventListener('scribe-focus-end', onFocusEnd);

        return () => {
            inputElement!.removeEventListener('scribe-focus-start', onFocusStart);
            inputElement!.removeEventListener('scribe-focus-end', onFocusEnd);
        };
    });
</script>

<input 
    bind:this={inputElement}
    id={componentData.id} 
    data-scribe-focusable="true"
    onkeydown={handleKeyDown}
    autocomplete="off"
    {style} 
    placeholder={config?.placeholder} 
    class="text-input" 
    type="text" 
    bind:value={dataStore.data[bindValue.id].value} 
/>

<style>
    .text-input {
        padding: 0.5em;
        border: 1px solid #ccc;
        border-radius: 0.5em;
        min-width: 10rem;
        margin: 0 0.5rem;
    }
</style>
