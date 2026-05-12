import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import TextInputComponentSvelte from '$lib/components/defaultComponents/TextInputComponentSvelte.svelte';
import type { ImageComponent, TextComponent, TextInputComponent } from '$lib/domain/components/DefaultComponents.js';
import ImageComponentSvelte from '$lib/components/defaultComponents/ImageComponentSvelte.svelte';

export type DefaultComponents = TextComponent | TextInputComponent | ImageComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': TextComponentSvelte,
    'text-input': TextInputComponentSvelte,
    'image': ImageComponentSvelte,
};
