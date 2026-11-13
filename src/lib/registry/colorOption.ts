import { mount, unmount } from 'svelte';
import type { ComponentEditOptionContext, ComponentEditOptions } from './ComponentEditOptions.js';
import ColorPickerOption from '$lib/components/componentOptions/ColorPickerOption.svelte';
import { editStore } from '$lib/stores/edit-store.svelte.js';
import { isHexColor } from '$lib/utils/colorPalette.js';

export interface ColorOptionDefinition {
    /** Unique among the options of the component, like any `ComponentEditOptions.type` */
    type: string;
    /** Name of the option: the tooltip and the accessible name */
    name: string;
    /** Short text under the colour block. Without it the option is drawn as a small icon button */
    label?: string;
    /** Title of the group of the ribbon the option belongs to */
    group?: string;
    shortcut?: string;
    /** Key of the component config that stores the colour, as a `#rrggbb` string. The option reads and writes `config[configKey]` */
    configKey: string;
    /** Colour drawn when the config has none, as `#rrggbb` */
    defaultColor: string;
    /** Adds an Automático row to the panel that removes the colour from the config, so the component goes back to drawing its own */
    resettable?: boolean;
    /** Disables the option on top of the disabled options of the component. Evaluated reactively like `ComponentEditOptions.isDisabled` */
    isDisabled?: (data: ComponentEditOptionContext) => boolean;
}

/** The component a colour option acts on, which changes as the selection does */
export interface ColorTarget {
    sectionId: string;
    componentId: string;
}

/** Where a colour option reads and writes the colour. The panel reads it again whenever what `getColor` reads changes */
export interface ColorAccessors {
    getColor: (target: ColorTarget) => string | undefined;
    /** Null removes the colour */
    setColor: (color: string | null, target: ColorTarget) => void;
    /**
     * Called when the native picker opens, to keep what the colour acts on at that moment. The native picker reports the colour after the
     * click that closes it, which can move what is selected. The returned function sets the colour on what was kept. Without it the colour
     * goes through `setColor`, which suits a target that does not move (the config of a component)
     */
    holdTarget?: () => (color: string | null) => void;
}

interface ColorPickerDefinition {
    type: string;
    name: string;
    label?: string;
    group?: string;
    shortcut?: string;
    /** Icon of the option. It is the whole icon of a small button, which gets a bar of the colour under it */
    icon: string;
    defaultColor?: string;
    resettable?: boolean;
    keepTextFocus?: boolean;
    isDisabled?: (data: ComponentEditOptionContext) => boolean;
}

const FALLBACK_COLOR = '#000000';

/**
 * Mounts the colour picker as a ribbon option that reads and writes the colour through the accessors. Both the public factory (a colour
 * in the config of the component) and the colour of a text (a fragment, kept in the store of the formats) are built on it
 */
export function createColorPickerOption(definition: ColorPickerDefinition, accessors: ColorAccessors): ComponentEditOptions {
    const { type, name, label, group, shortcut, icon, defaultColor, resettable, keepTextFocus, isDisabled } = definition;

    return {
        type,
        name,
        label,
        group,
        shortcut,
        isDisabled,
        render: (container, props) => {
            // The props of an option are getters that follow the component, which a spread would read only once
            const pickerProps = Object.defineProperties(
                { ...accessors, defaultColor, resettable, keepTextFocus },
                Object.getOwnPropertyDescriptors(props)
            ) as typeof props & ColorAccessors & { defaultColor?: string; resettable?: boolean; keepTextFocus?: boolean };
            const app = mount(ColorPickerOption, { target: container, props: pickerProps });
            return () => unmount(app);
        },
        props: { icon },
    };
}

/**
 * Creates the option of a colour picker for the ribbon: a button with a block of the current colour that opens a palette, with the
 * native picker for any other colour. It stores the choice in the config of the component under `configKey`, and the component
 * reads it from there (check it with `isHexColor`, as it comes from the document). Put it in the `options` of a registry entry
 */
export function createColorOption(definition: ColorOptionDefinition): ComponentEditOptions {
    const { configKey } = definition;

    if (!isHexColor(definition.defaultColor)) {
        console.warn(`[Scribe] The default colour "${definition.defaultColor}" of the option "${definition.type}" is not a #rrggbb colour. ${FALLBACK_COLOR} is used.`);
    }
    const defaultColor = isHexColor(definition.defaultColor) ? definition.defaultColor : FALLBACK_COLOR;

    return createColorPickerOption(
        {
            type: definition.type,
            name: definition.name,
            label: definition.label,
            group: definition.group,
            shortcut: definition.shortcut,
            // Only used when something draws the option without its render function
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${defaultColor}" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/></svg>`,
            defaultColor,
            resettable: definition.resettable,
            isDisabled: definition.isDisabled,
        },
        {
            getColor: ({ sectionId, componentId }) => {
                const stored = editStore.getComponentConfig(sectionId, componentId)?.[configKey];
                return typeof stored === 'string' ? stored : undefined;
            },
            setColor: (color, { sectionId, componentId }) => {
                const config = { ...editStore.getComponentConfig(sectionId, componentId) };
                if (color === null) delete config[configKey];
                else config[configKey] = color;
                editStore.setComponentConfig(sectionId, componentId, config);
            },
        }
    );
}
