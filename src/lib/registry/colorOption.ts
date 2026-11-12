import { mount, unmount } from 'svelte';
import type { ComponentEditOptions } from './ComponentEditOptions.js';
import ColorPickerOption from '$lib/components/componentOptions/ColorPickerOption.svelte';
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
}

const FALLBACK_COLOR = '#000000';

/**
 * Creates the option of a colour picker for the ribbon: a button with a block of the current colour that opens a palette, with the
 * native picker for any other colour. It stores the choice in the config of the component under `configKey`, and the component
 * reads it from there (check it with `isHexColor`, as it comes from the document). Put it in the `options` of a registry entry
 */
export function createColorOption(definition: ColorOptionDefinition): ComponentEditOptions {
    const { type, name, label, group, shortcut, configKey } = definition;

    if (!isHexColor(definition.defaultColor)) {
        console.warn(`[Scribe] The default colour "${definition.defaultColor}" of the option "${type}" is not a #rrggbb colour. ${FALLBACK_COLOR} is used.`);
    }
    const defaultColor = isHexColor(definition.defaultColor) ? definition.defaultColor : FALLBACK_COLOR;

    return {
        type,
        name,
        label,
        group,
        shortcut,
        render: (container, props) => {
            // The props of an option are getters that follow the component, which a spread would read only once
            const colorProps = Object.defineProperties({ configKey, defaultColor }, Object.getOwnPropertyDescriptors(props)) as typeof props & { configKey: string; defaultColor: string };
            const app = mount(ColorPickerOption, { target: container, props: colorProps });
            return () => unmount(app);
        },
        props: {
            // Only used when something draws the option without its render function
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${defaultColor}" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/></svg>`,
        },
    };
}
