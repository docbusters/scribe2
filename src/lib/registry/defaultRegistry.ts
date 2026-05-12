import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import TextInputComponentSvelte from '$lib/components/defaultComponents/TextInputComponentSvelte.svelte';
import type { ImageComponent, LatexComponent, TableComponent, TextComponent, TextInputComponent } from '$lib/domain/components/DefaultComponents.js';
import ImageComponentSvelte from '$lib/components/defaultComponents/ImageComponentSvelte.svelte';
import LatexComponentSvelte from '$lib/components/defaultComponents/LatexComponentSvelte.svelte';
import TableComponentSvelte from '$lib/components/defaultComponents/TableComponentSvelte.svelte';

export type DefaultComponents = TextComponent | TextInputComponent | ImageComponent | LatexComponent | TableComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': TextComponentSvelte,
    'text-input': TextInputComponentSvelte,
    'image': ImageComponentSvelte,
    'latex': LatexComponentSvelte,
    'table': TableComponentSvelte,
};
