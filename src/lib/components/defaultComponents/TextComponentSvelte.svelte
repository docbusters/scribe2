<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextComponent } from '$lib/domain/components/DefaultComponents.js';
	import type { StringValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { toolbarStore } from '$lib/stores/toolbar-store.svelte.js';
	import { parseStringForContentEditable } from '$lib/utils/parseStringForContentEditable.js';

    let { componentData, sectionId, mode }: ScribeComponentProps<TextComponent> = $props();

    function handleTextChange(event: Event & { currentTarget: EventTarget & HTMLDivElement; }) {
        const target = event.target as HTMLDivElement;
        const newValue: StringValue = { type: 'string', value: target.innerText };
        console.log('New value:', newValue);
        editStore.setComponentValue(sectionId, componentData.id, newValue);
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const target = event.currentTarget;
        const range = selection.getRangeAt(0);

        const preRange = range.cloneRange();
        preRange.selectNodeContents(target);
        preRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = preRange.toString();

        const postRange = range.cloneRange();
        postRange.selectNodeContents(target);
        postRange.setStart(range.endContainer, range.endOffset);
        
        // Clean possible \n or \r from the end of the text, as contenteditable can sometimes add these
        const textAfter = postRange.toString().replace(/[\n\r]+$/, '');

        const isAtStart = textBefore.length === 0;
        const isAtEnd = textAfter.length === 0;

        switch (event.key) {
            case 'Delete': {
                if (isAtEnd) {
                    // Try to delete br at the end of the contenteditable, as contenteditable adds an extra <br>
                    if (target.lastElementChild?.tagName === 'BR') {
                        target.lastElementChild.remove();
                        event.preventDefault();
                    }
                }
                break;
            }
            case 'ArrowLeft': {
                if (isAtStart) {
                    console.log('At start of text, should move to previous component');
                }
                break;
            }
            case 'ArrowRight': {
                if (isAtEnd) {
                    console.log('At end of text, should move to next component');
                }
                break;
            }
            case '/': {
                const isSpaceBefore = isAtStart || /\s$/.test(textBefore);
                const isSpaceAfter = isAtEnd || /^\s/.test(textAfter);

                // If the slash is part of a word, do nothing special
                if (!isSpaceBefore || !isSpaceAfter) {
                    return;
                }

                // Show the add component dropdown
                const rect = range.getBoundingClientRect();
                toolbarStore.open(rect.x, rect.bottom);
                break;
            }
        }
    }

    let value = $derived(parseStringForContentEditable(componentData.value.value));
</script>

{#key value}
    <div role="textbox" tabindex="0" class="edit-text" contenteditable={mode === 'edit'} onblur={handleTextChange} onkeydown={handleKeyDown}>
        {#if mode === 'view'}
            {componentData.value.value}
        {:else if mode === 'edit'}
            {#each value as line, index (index)}
                {#if line === ''}
                    <br>
                {:else}
                    {line}
                {/if}
            {/each}
        {/if}
    </div>
{/key}

<style>
    .edit-text {
        outline: none;
        display: inline;
    }
</style>
