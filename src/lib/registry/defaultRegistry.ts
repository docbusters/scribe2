import type { TextComponent } from '../domain/components/TextComponent.js';
import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import type { TextInputComponent } from '$lib/domain/components/InputComponent.js';
import TextInputComponentSvelte from '$lib/components/defaultComponents/TextInputComponentSvelte.svelte';

export type DefaultComponents = TextComponent | TextInputComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': TextComponentSvelte,
    'text-input': TextInputComponentSvelte,
};
