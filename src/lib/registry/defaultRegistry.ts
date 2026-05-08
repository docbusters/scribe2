import type { TextComponent } from '../domain/components/TextComponent.js';
import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';

export type DefaultComponents = TextComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': TextComponentSvelte
};
