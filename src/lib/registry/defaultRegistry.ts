import type { ComponentRegistry, ScribeComponentProps } from './ComponentRegistry.js';
import { createSvelte5Mount } from './svelteMountHelper.svelte.js';
import TextComponentScribe from '../components/defaultComponents/TextComponentScribe.svelte';
import TextInputComponentScribe from '../components/defaultComponents/TextInputComponentScribe.svelte';
import type { ChartComponent, ImageComponent, LatexComponent, MapComponent, QrComponent, TableComponent, TextBindingComponent, TextComponent, TextInputComponent, VideoComponent } from '../domain/components/DefaultComponents.js';
import ImageComponentScribe from '../components/defaultComponents/ImageComponentScribe.svelte';
import LatexComponentScribe from '../components/defaultComponents/LatexComponentScribe.svelte';
import VideoComponentScribe from '../components/defaultComponents/VideoComponentScribe.svelte';
import QrComponentScribe from '../components/defaultComponents/QrComponentScribe.svelte';
import TableComponentScribe from '../components/defaultComponents/TableComponentScribe.svelte';
import { addComponentOption, defaultComponentOptions, deleteComponentOption, duplicateComponentOption, type ComponentEditOnClick, type ComponentEditOptions } from './ComponentEditOptions.js';
import { editStore } from '$lib/stores/edit-store.svelte.js';
import { textFormatStore } from '$lib/stores/text-format-store.svelte.js';
import type { TextFormatCommand } from '$lib/utils/textFormat.js';
import type { ImageComponentConfig, MapComponentConfig, QrComponentConfig, TableComponentConfig, TextInputComponentConfig, ChartComponentConfig } from '$lib/domain/components/DefaultComponentsConfig.js';
import MapComponentScribe from '$lib/components/defaultComponents/MapComponentScribe.svelte';
import TextBindingComponentScribe from '$lib/components/defaultComponents/TextBindingComponentScribe.svelte';
import ChartComponentScribe from '$lib/components/defaultComponents/ChartComponentScribe.svelte';
import ChartEditorDataConfig from '$lib/components/componentOptions/chart/ChartEditorDataConfig.svelte';
import { mount, unmount } from 'svelte';
import { defaultI18n, type I18nService } from '../i18n/i18n.svelte.js';

export type DefaultComponents = TextComponent | TextBindingComponent | TextInputComponent | ImageComponent | VideoComponent | QrComponent | LatexComponent | TableComponent | MapComponent | ChartComponent;

/** Returns the default component implementations, localized with the given i18n service */
export function getDefaultRegistry(i18n: I18nService): ComponentRegistry {
    // Titles of the groups of options in the top toolbar
    const groups = {
        alignment: i18n.t('topToolbar.groups.alignment'),
        fit: i18n.t('topToolbar.groups.fit'),
        controls: i18n.t('topToolbar.groups.controls'),
        layout: i18n.t('topToolbar.groups.layout'),
        chartType: i18n.t('topToolbar.groups.chartType'),
        table: i18n.t('topToolbar.groups.table'),
        dots: i18n.t('topToolbar.groups.dots'),
        // Same group as the default "set value" option, so both buttons are drawn together
        data: i18n.t('topToolbar.groups.data'),
        format: i18n.t('topToolbar.groups.format'),
    };

    /**
     * Option that toggles a format. It acts on the text that holds the caret, which the store follows: it formats the marked
     * fragment, or the characters typed next when there is only a caret. It shows as selected when the format is active there
     */
    function createTextFormatOption(command: TextFormatCommand, name: string, shortcut: string, icon: string): ComponentEditOptions {
        return {
            type: `format-${command}`,
            name,
            shortcut,
            group: groups.format,
            isSelected: () => textFormatStore.componentId !== null && textFormatStore.activeFormats[command],
            isDisabled: () => !textFormatStore.canFormat,
            props: {
                icon,
                onclick: () => textFormatStore.toggle(command),
            },
        };
    }

    /** Option that sets the shape of the dots of a QR code. Square is the one drawn when the config has none */
    function createQrDotsOption(dotsType: NonNullable<QrComponentConfig['dotsType']>, name: string, shortcut: string, icon: string): ComponentEditOptions {
        return {
            type: `qr-dots-${dotsType}`,
            name,
            shortcut,
            group: groups.dots,
            isSelected: (data) => ((data.config as QrComponentConfig | undefined)?.dotsType ?? 'square') === dotsType,
            props: {
                icon,
                onclick: (data: ComponentEditOnClick) => {
                    const { sectionId, componentId } = data;
                    const config = editStore.getComponentConfig(sectionId, componentId);
                    editStore.setComponentConfig(sectionId, componentId, { ...config, dotsType });
                }
            },
        };
    }

    return {
    'text-binding': {
        name: i18n.t('components.text-binding.name'),
        description: i18n.t('components.text-binding.description'),
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
        name: i18n.t('components.text.name'),
        description: i18n.t('components.text.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-case-sensitive-icon lucide-case-sensitive"><path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16"/><path d="M22 9v7"/><path d="M3.304 13h6.392"/><circle cx="18.5" cy="12.5" r="3.5"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TextComponent>>(TextComponentScribe),
        empty: {
            type: 'text',
            mode: 'inline',
            value: 'string',
        },
        valueTypes: ['empty', 'string'],
        options: [
            ...defaultComponentOptions,
            createTextFormatOption('bold', i18n.t('textFormat.bold'), 'Mod+B', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>'),
            createTextFormatOption('italic', i18n.t('textFormat.italic'), 'Mod+I', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>'),
            createTextFormatOption('underline', i18n.t('textFormat.underline'), 'Mod+U', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>'),
            createTextFormatOption('strikethrough', i18n.t('textFormat.strikethrough'), 'Mod+Shift+X', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>'),
        ],
    },
    'text-input': {
        name: i18n.t('components.text-input.name'),
        description: i18n.t('components.text-input.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input-icon lucide-text-cursor-input"><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/><path d="M9 6v12"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<TextInputComponent>>(TextInputComponentScribe),
        empty: {
            type: 'text-input',
            mode: 'inline',
            value: 'binding',
        },
        initialValue: {
            type: 'string',
            value: '',
        },
        valueTypes: ['binding'],
        supportedBindingValueTypes: ['empty', 'string', 'number'],
        options: [
            ...defaultComponentOptions,
            {
                type: 'expand-content',
                shortcut: 'Alt+Shift+1',
                name: i18n.t('options.expandWithContent'),
                group: groups.layout,
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
        name: i18n.t('components.image.name'),
        description: i18n.t('components.image.description'),
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
                shortcut: 'Mod+Shift+L',
                name: i18n.t('options.alignLeft'),
                group: groups.alignment,
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
                shortcut: 'Mod+Shift+E',
                name: i18n.t('options.alignCenter'),
                group: groups.alignment,
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
                shortcut: 'Mod+Shift+R',
                name: i18n.t('options.alignRight'),
                group: groups.alignment,
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
                shortcut: 'Alt+Shift+1',
                name: i18n.t('options.fitContain'),
                group: groups.fit,
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
                shortcut: 'Alt+Shift+2',
                name: i18n.t('options.fitCover'),
                group: groups.fit,
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
                shortcut: 'Alt+Shift+3',
                name: i18n.t('options.fitFill'),
                group: groups.fit,
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
    'video': {
        name: i18n.t('components.video.name'),
        description: i18n.t('components.video.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-play-icon lucide-square-play"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<VideoComponent>>(VideoComponentScribe),
        isResizeable: true,
        height: { default: 360, min: 200, max: 800 },
        empty: {
            type: 'video',
            mode: 'block',
            value: 'string',
        },
        valueTypes: ['string', 'binding'],
        supportedBindingValueTypes: ['empty', 'string'],
    },
    'qr': {
        name: i18n.t('components.qr.name'),
        description: i18n.t('components.qr.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-qr-code-icon lucide-qr-code"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<QrComponent>>(QrComponentScribe),
        isResizeable: true,
        height: { default: 240, min: 96, max: 600 },
        options: [
            ...defaultComponentOptions,
            // Each icon is a 2x2 grid of dots drawn in the style it sets
            createQrDotsOption('square', i18n.t('options.qrDotsSquare'), 'Alt+Shift+1', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>'),
            createQrDotsOption('rounded', i18n.t('options.qrDotsRounded'), 'Alt+Shift+2', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="7" height="7" rx="2.5"/><rect x="13" y="4" width="7" height="7" rx="2.5"/><rect x="4" y="13" width="7" height="7" rx="2.5"/><rect x="13" y="13" width="7" height="7" rx="2.5"/></svg>'),
            createQrDotsOption('dots', i18n.t('options.qrDotsCircular'), 'Alt+Shift+3', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="7.5" cy="7.5" r="3.5"/><circle cx="16.5" cy="7.5" r="3.5"/><circle cx="7.5" cy="16.5" r="3.5"/><circle cx="16.5" cy="16.5" r="3.5"/></svg>'),
            createQrDotsOption('classy', i18n.t('options.qrDotsClassy'), 'Alt+Shift+4', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 7.5a3.5 3.5 0 0 1 3.5-3.5H11v3.5a3.5 3.5 0 0 1-3.5 3.5H4z"/><path d="M13 7.5a3.5 3.5 0 0 1 3.5-3.5H20v3.5a3.5 3.5 0 0 1-3.5 3.5H13z"/><path d="M4 16.5a3.5 3.5 0 0 1 3.5-3.5H11v3.5a3.5 3.5 0 0 1-3.5 3.5H4z"/><path d="M13 16.5a3.5 3.5 0 0 1 3.5-3.5H20v3.5a3.5 3.5 0 0 1-3.5 3.5H13z"/></svg>'),
        ],
        empty: {
            type: 'qr',
            mode: 'block',
            value: 'string',
        },
        valueTypes: ['string', 'binding'],
        supportedBindingValueTypes: ['empty', 'string'],
    },
    'latex': {
        name: i18n.t('components.latex.name'),
        description: i18n.t('components.latex.description'),
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
        name: i18n.t('components.table.name'),
        description: i18n.t('components.table.description'),
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
        options: [
            addComponentOption,
            duplicateComponentOption,
            deleteComponentOption,
            {
                type: 'table-add-row',
                shortcut: 'Alt+Shift+1',
                name: i18n.t('options.tableAddRow'),
                group: groups.table,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-between-horizontal-end-icon lucide-between-horizontal-end"><rect width="13" height="7" x="3" y="3" rx="1"/><path d="m22 15-3-3 3-3"/><rect width="13" height="7" x="3" y="14" rx="1"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as TableComponentConfig | undefined;
                        if (!config) return;
                        // A missing cell is an empty slot, so the new row needs nothing in the value
                        editStore.setComponentConfig(sectionId, componentId, { ...config, rows: config.rows + 1 });
                    }
                },
            },
            {
                type: 'table-add-col',
                shortcut: 'Alt+Shift+2',
                name: i18n.t('options.tableAddColumn'),
                group: groups.table,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-between-vertical-end-icon lucide-between-vertical-end"><rect width="7" height="13" x="3" y="3" rx="1"/><path d="m9 22 3-3 3 3"/><rect width="7" height="13" x="14" y="3" rx="1"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as TableComponentConfig | undefined;
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, cols: config.cols + 1 });
                    }
                },
            },
            {
                type: 'table-toggle-borders',
                shortcut: 'Alt+Shift+3',
                name: i18n.t('options.tableBorders'),
                group: groups.table,
                isSelected: (data) => (data.config as TableComponentConfig | undefined)?.showBorders !== false,
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid-3x3-icon lucide-grid-3x3"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId) as TableComponentConfig | undefined;
                        if (!config) return;
                        editStore.setComponentConfig(sectionId, componentId, { ...config, showBorders: config.showBorders === false });
                    }
                },
            },
        ],
        valueTypes: ['record'],
    },
    'map': {
        name: i18n.t('components.map.name'),
        description: i18n.t('components.map.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-icon lucide-map"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<MapComponent>>(MapComponentScribe),
        isResizeable: true,
        height: { default: 400, min: 200, max: 800 },
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
                shortcut: 'Alt+Shift+1',
                name: i18n.t('options.mapReadOnly'),
                group: groups.controls,
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
                shortcut: 'Alt+Shift+2',
                name: i18n.t('options.mapSearchbar'),
                group: groups.controls,
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
                shortcut: 'Alt+Shift+3',
                name: i18n.t('options.mapGlobe'),
                group: groups.controls,
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
                shortcut: 'Alt+Shift+4',
                name: i18n.t('options.mapZoom'),
                group: groups.controls,
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
                shortcut: 'Alt+Shift+5',
                name: i18n.t('options.mapCurrentPosition'),
                group: groups.controls,
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
                shortcut: 'Alt+Shift+6',
                name: i18n.t('options.mapDraggableMarker'),
                group: groups.controls,
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
    },
    'chart': {
        name: i18n.t('components.chart.name'),
        description: i18n.t('components.chart.description'),
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column-icon lucide-chart-column"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
        ...createSvelte5Mount<ScribeComponentProps<ChartComponent>>(ChartComponentScribe),
        isResizeable: true,
        height: { default: 300, min: 150, max: 800 },
        empty: {
            type: 'chart',
            mode: 'block',
            value: 'array',
            config: {
                type: 'arc',
                xAxisKey: 'vegetable',
                series: [{ key: 'vegetable', label: 'Vegetable', color: '#0388fc' }, { key: 'amount', label: 'Amount', color: '#fca303' }],
            }
        },
        initialValue: {
            type: 'array',
            value: [
                { 
                    type: 'record',
                    value: { vegetable: { type: 'string', value: 'Carrots' }, amount: { type: 'number', value: 10 } },
                },
                { 
                    type: 'record',
                    value: { vegetable: { type: 'string', value: 'Broccoli' }, amount: { type: 'number', value: 15 } },
                },
                { 
                    type: 'record',
                    value: { vegetable: { type: 'string', value: 'Spinach' }, amount: { type: 'number', value: 7 } },
                },
                {
                    type: 'record',
                    value: { vegetable: { type: 'string', value: 'Peas' }, amount: { type: 'number', value: 12 } },
                },
                {
                    type: 'record',
                    value: { vegetable: { type: 'string', value: 'Corn' }, amount: { type: 'number', value: 20 } },
                }
            ]
        },
        options: [
            ...defaultComponentOptions,
            {
                type: 'chart-data-config',
                shortcut: 'Mod+Shift+K',
                name: i18n.t('options.chartDataConfig'),
                label: i18n.t('topToolbar.configureLabel'),
                group: groups.data,
                render: (container, props) => {
                    const app = mount(ChartEditorDataConfig, {
                        target: container,
                        props,
                    });
                    return () => unmount(app);
                },
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers-icon lucide-layers"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>',
                }
            },
            {
                type: 'chart-type-bar',
                shortcut: 'Alt+Shift+1',
                name: i18n.t('options.chartBar'),
                group: groups.chartType,
                isSelected: (data) => (data.config as ChartComponentConfig)?.type === 'bar',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column-icon lucide-chart-column"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        editStore.setComponentConfig(sectionId, componentId, { ...config, type: 'bar' });
                    }
                }
            },
            {
                type: 'chart-type-line',
                shortcut: 'Alt+Shift+2',
                name: i18n.t('options.chartLine'),
                group: groups.chartType,
                isSelected: (data) => (data.config as ChartComponentConfig)?.type === 'line',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-line-icon lucide-chart-line"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        editStore.setComponentConfig(sectionId, componentId, { ...config, type: 'line' });
                    }
                }
            },
            {
                type: 'chart-type-area',
                shortcut: 'Alt+Shift+3',
                name: i18n.t('options.chartArea'),
                group: groups.chartType,
                isSelected: (data) => (data.config as ChartComponentConfig)?.type === 'area',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-area-icon lucide-chart-area"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 11.207a.5.5 0 0 1 .146-.353l2-2a.5.5 0 0 1 .708 0l3.292 3.292a.5.5 0 0 0 .708 0l4.292-4.292a.5.5 0 0 1 .854.353V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        editStore.setComponentConfig(sectionId, componentId, { ...config, type: 'area' });
                    }
                }
            },
            {
                type: 'chart-type-pie',
                shortcut: 'Alt+Shift+4',
                name: i18n.t('options.chartPie'),
                group: groups.chartType,
                isSelected: (data) => (data.config as ChartComponentConfig)?.type === 'pie',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-pie-icon lucide-chart-pie"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        editStore.setComponentConfig(sectionId, componentId, { ...config, type: 'pie' });
                    }
                }
            },
            {
                type: 'chart-type-arc',
                shortcut: 'Alt+Shift+5',
                name: i18n.t('options.chartArc'),
                group: groups.chartType,
                isSelected: (data) => (data.config as ChartComponentConfig)?.type === 'arc',
                props: {
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rainbow-icon lucide-rainbow"><path d="M22 17a10 10 0 0 0-20 0"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M10 17a2 2 0 0 1 4 0"/></svg>',
                    onclick: (data: ComponentEditOnClick) => {
                        const { sectionId, componentId } = data;
                        const config = editStore.getComponentConfig(sectionId, componentId);
                        editStore.setComponentConfig(sectionId, componentId, { ...config, type: 'arc' });
                    }
                }
            },
        ],
        valueTypes: ['array', 'binding'],
        supportedBindingValueTypes: ['array']
    },
    };
}

export const defaultRegistry: ComponentRegistry = getDefaultRegistry(defaultI18n);

