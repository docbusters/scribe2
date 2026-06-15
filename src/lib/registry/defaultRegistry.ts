import type { ComponentRegistry, ScribeComponentProps } from './ComponentRegistry.js';
import { createSvelte5Mount } from './svelteMountHelper.svelte.js';
import TextComponentScribe from '../components/defaultComponents/TextComponentScribe.svelte';
import TextInputComponentScribe from '../components/defaultComponents/TextInputComponentScribe.svelte';
import type { ImageComponent, LatexComponent, MapComponent, TableComponent, TextBindingComponent, TextComponent, TextInputComponent } from '../domain/components/DefaultComponents.js';
import ImageComponentScribe from '../components/defaultComponents/ImageComponentScribe.svelte';
import LatexComponentScribe from '../components/defaultComponents/LatexComponentScribe.svelte';
import TableComponentScribe from '../components/defaultComponents/TableComponentScribe.svelte';
import { defaultComponentOptions, type ComponentEditOnClick } from './ComponentEditOptions.js';
import { editStore } from '$lib/stores/edit-store.svelte.js';
import type { ImageComponentConfig, MapComponentConfig, TextInputComponentConfig } from '$lib/domain/components/DefaultComponentsConfig.js';
import MapComponentScribe from '$lib/components/defaultComponents/MapComponentScribe.svelte';
import TextBindingComponentScribe from '$lib/components/defaultComponents/TextBindingComponentScribe.svelte';

export type DefaultComponents = TextComponent | TextBindingComponent | TextInputComponent | ImageComponent | LatexComponent | TableComponent | MapComponent;

/** Contains default component implementations */
export const defaultRegistry: ComponentRegistry = {
    'text-binding': {
        name: 'Text Binding',
        description: 'Text that can be binded',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-text-icon lucide-scan-text"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h8"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TextBindingComponent>>(TextBindingComponentScribe),
        empty: {
            type: 'text-binding',
            mode: 'inline',
            value: 'binding',
        },
        valueTypes: ['binding'],
        supportedBindingValueTypes: ['empty', 'string', 'number', 'boolean', 'date'],
    },
    'text': {
        name: 'Text',
        description: 'As simple as it gets',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-case-sensitive-icon lucide-case-sensitive"><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"/><path d="M22 9v7"/><path d="M3.304 13h6.392"/><circle cx="18.5" cy="12.5" r="3.5"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TextComponent>>(TextComponentScribe),
        empty: {
            type: 'text',
            mode: 'inline',
            value: 'string',
        },
        valueTypes: ['empty', 'string'],
    },
    'text-input': {
        name: 'Text Input',
        description: 'Used to input text',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input-icon lucide-text-cursor-input"><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/><path d="M9 6v12"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TextInputComponent>>(TextInputComponentScribe),
        empty: {
            type: 'text-input',
            mode: 'inline',
            value: 'binding',
        },
        valueTypes: ['binding'],
        supportedBindingValueTypes: ['empty', 'string'],
        options: [
            ...defaultComponentOptions,
            {
                type: 'expand-content',
                name: 'Expand with content',
                isSelected: (data: { config?: TextInputComponentConfig }) => data.config?.expandWithContent === true,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand-icon lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        const current = config?.expandWithContent ?? false;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, expandWithContent: !current });
                    }
                },
            },
        ],
    },
    'image': {
        name: 'Image',
        description: 'Display online images',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<ImageComponent>>(ImageComponentScribe),
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
                        editStore.setComponentConfig(sectionId, componentId, { ...config, position: 'fill' });
                    }
                },
            },
        ],
        valueTypes: ['string', 'binding'],
        supportedBindingValueTypes: ['empty', 'string'],
    },
    'latex': {
        name: 'LaTeX',
        description: 'Render LaTeX formulas',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sigma-icon lucide-sigma"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<LatexComponent>>(LatexComponentScribe),
        empty: {
            type: 'latex',
            mode: 'block',
            value: 'string',
        },
        valueTypes: ['string', 'binding'],
        supportedBindingValueTypes: ['empty', 'string'],
    },
    'table': {
        name: 'Table',
        description: 'Create tables to organize your content',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TableComponent>>(TableComponentScribe),
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
    },
    'map': {
        name: 'Map',
        description: 'Create interactive maps',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-icon lucide-map"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<MapComponent>>(MapComponentScribe),
        empty: {
            type: 'map',
            mode: 'block',
            value: 'record',
            config: {
                isMarkerDraggable: true,
                hasCurrentPosBtn: true,
                hasGlobeBtn: true,
                hasZoomBtn: true,
                hasSearchbar: true,
            }
        },
        initialValue: {
            type: 'record',
            value: {
                latitude: { type: 'number', value: 40.41680843983418},
                longitude: { type: 'number', value: -3.7032674437111246 },
                address: { type: 'string', value: 'Madrid, Spain' },
            },
        },
        options: [
            ...defaultComponentOptions,
            {
                type: 'toggle-readonly',
                name: 'Toggle Read-only',
                isSelected: (data: { config?: MapComponentConfig }) => data.config?.readonly === true,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open-text-icon lucide-book-open-text"><path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.readonly ?? false;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, readonly: !current });
                    }
                },
            },
            {
                type: 'toggle-searchbar',
                name: 'Toggle Searchbar',
                isSelected: (data: { config?: MapComponentConfig }) => data.config?.hasSearchbar === true,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.hasSearchbar ?? false;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, hasSearchbar: !current });
                    }
                },
            },
            {
                type: 'toggle-globe',
                name: 'Toggle Globe Button',
                isSelected: (data: { config?: MapComponentConfig }) => data.config?.hasGlobeBtn !== false,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.hasGlobeBtn ?? true;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, hasGlobeBtn: !current });
                    }
                },
            },
            {
                type: 'toggle-zoom',
                name: 'Toggle Zoom Buttons',
                isSelected: (data: { config?: MapComponentConfig }) => data.config?.hasZoomBtn !== false,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in-icon lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.hasZoomBtn ?? true;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, hasZoomBtn: !current });
                    }
                },
            },
            {
                type: 'toggle-current-pos',
                name: 'Toggle Current Position Button',
                isSelected: (data: { config?: MapComponentConfig }) => data.config?.hasCurrentPosBtn !== false,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed-icon lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.hasCurrentPosBtn ?? true;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, hasCurrentPosBtn: !current });
                    }
                },
            },
            {
                type: 'toggle-draggable',
                name: 'Toggle Draggable Marker',
                isSelected: (data: { config?: MapComponentConfig }) =>  data.config?.isMarkerDraggable === true,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as MapComponentConfig;
                        const current = config?.isMarkerDraggable ?? false;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, isMarkerDraggable: !current });
                    }
                },
            }
        ],
        valueTypes: ['record', 'binding'],
        supportedBindingValueTypes: ['empty', 'record'],
        
    }
};
