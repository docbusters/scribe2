import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import TextInputComponentSvelte from '../components/defaultComponents/TextInputComponentSvelte.svelte';
import type { ImageComponent, LatexComponent, TableComponent, TextComponent, TextInputComponent } from '../domain/components/DefaultComponents.js';
import ImageComponentSvelte from '../components/defaultComponents/ImageComponentSvelte.svelte';
import LatexComponentSvelte from '../components/defaultComponents/LatexComponentSvelte.svelte';
import TableComponentSvelte from '../components/defaultComponents/TableComponentSvelte.svelte';

export type DefaultComponents = TextComponent | TextInputComponent | ImageComponent | LatexComponent | TableComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text': {
        name: 'Text',
        description: 'As simple as it gets',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-case-sensitive-icon lucide-case-sensitive"><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"/><path d="M22 9v7"/><path d="M3.304 13h6.392"/><circle cx="18.5" cy="12.5" r="3.5"/></svg>',
        component: TextComponentSvelte,
        empty: {
            type: 'text',
            mode: 'inline',
            value: 'string',
        },
        valueTypes: ['string'],
    },
    'text-input': {
        name: 'Text Input',
        description: 'Used to input text',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input-icon lucide-text-cursor-input"><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/><path d="M9 6v12"/></svg>',
        component: TextInputComponentSvelte,
        empty: {
            type: 'text-input',
            mode: 'inline',
            value: 'binding',
        },
        valueTypes: ['binding'],
    },
    'image': {
        name: 'Image',
        description: 'Display online images',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        component: ImageComponentSvelte,
        empty: {
            type: 'image',
            mode: 'block',
            value: 'string',
        },
        valueTypes: ['string', 'binding'],
    },
    'latex': {
        name: 'LaTeX',
        description: 'Render LaTeX formulas',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sigma-icon lucide-sigma"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/></svg>',
        component: LatexComponentSvelte,
        empty: {
            type: 'latex',
            mode: 'block',
            value: 'string',
        },
        valueTypes: ['string', 'binding'],
    },
    'table': {
        name: 'Table',
        description: 'Create tables to organize your content',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>',
        component: TableComponentSvelte,
        empty: {
            type: 'table',
            mode: 'block',
            value: 'record',
            config: {
                cols: 2,
                rows: 2,
            }
        },
        valueTypes: ['record'],
    }
};
