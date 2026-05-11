import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import TextInputComponentSvelte from '$lib/components/defaultComponents/TextInputComponentSvelte.svelte';
import type { TextComponent, TextInputComponent } from '$lib/domain/components/DefaultComponents.js';

export type DefaultComponents = TextComponent | TextInputComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': TextComponentSvelte,
    'text-input': TextInputComponentSvelte,
};
