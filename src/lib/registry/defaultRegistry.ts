import type { ComponentRegistry } from './ComponentRegistry.js';
import TextComponentSvelte from '../components/defaultComponents/TextComponentSvelte.svelte';
import TextInputComponentSvelte from '../components/defaultComponents/TextInputComponentSvelte.svelte';
import type { ImageComponent, LatexComponent, TableComponent, TextComponent, TextInputComponent } from '../domain/components/DefaultComponents.js';
import ImageComponentSvelte from '../components/defaultComponents/ImageComponentSvelte.svelte';
import LatexComponentSvelte from '../components/defaultComponents/LatexComponentSvelte.svelte';
import TableComponentSvelte from '../components/defaultComponents/TableComponentSvelte.svelte';
import { defaultComponentOptions, type ComponentEditOnClick } from './ComponentEditOptions.js';
import { editStore } from '$lib/stores/edit-store.svelte.js';
import type { ImageComponentConfig } from '$lib/domain/components/DefaultComponentsConfig.js';

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
            config: {
                align: 'center',
                position: 'contain',
            }
        },
        options: [
            ...defaultComponentOptions,
            {
                type: 'align-left',
                name: 'Align Left',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.align === 'left',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-align-start-icon lucide-text-align-start"><path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, align: 'left' });
                    }
                },
            },
            {
                type: 'align-center',
                name: 'Align Center',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.align !== undefined ? data.config.align === 'center' : true, // If align is not set, center is default
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-align-center-icon lucide-text-align-center"><path d="M21 5H3"/><path d="M17 12H7"/><path d="M19 19H5"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, align: 'center' });
                    }
                },
            },
            {
                type: 'align-right',
                name: 'Align Right',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.align === 'right',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-align-end-icon lucide-text-align-end"><path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, align: 'right' });
                    }
                },
            },
            {
                type: 'contain',
                name: 'Set image fit to contain',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.position !== undefined ? data.config?.position === 'contain' : true, // If position is not set, contain is default
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images-icon lucide-images"><path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><circle cx="13" cy="7" r="1" fill="currentColor"/><rect x="8" y="2" width="14" height="14" rx="2"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, position: 'contain' });
                    }
                },
            },
            {
                type: 'cover',
                name: 'Set image fit to cover',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.position === 'cover',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-upscale-icon lucide-image-upscale"><path d="M16 3h5v5"/><path d="M17 21h2a2 2 0 0 0 2-2"/><path d="M21 12v3"/><path d="m21 3-5 5"/><path d="M3 7V5a2 2 0 0 1 2-2"/><path d="m5 21 4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19"/><path d="M9 3h3"/><rect x="3" y="11" width="10" height="10" rx="1"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, position: 'cover' });
                    }
                },
            },
            {
                type: 'fill',
                name: 'Set image fit to fill',
                isSelected: (data: { config?: ImageComponentConfig }) => data.config?.position === 'fill',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fullscreen-icon lucide-fullscreen"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, position: 'fill' });
                    }
                },
            },
        ],
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
