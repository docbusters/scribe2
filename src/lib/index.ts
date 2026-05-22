import type { Document } from './domain/Document.js';
import type { ComponentRegistry } from './registry/ComponentRegistry.js';
import type { ScribeMode, ScribeProps } from './types/ScribeProps.js';

import ScribeComponent from './components/Scribe.svelte';

// COMPONENTS
export interface ScribeConstructor {
    new (): HTMLElement & ScribeProps;
    prototype: HTMLElement & ScribeProps;
}

export const Scribe = ScribeComponent as unknown as ScribeConstructor;
export { defaultRegistry } from './registry/defaultRegistry.js';

// TYPES
export type { ScribeProps } from './types/ScribeProps.js';

// DOCUMENT STRUCTURE
export type { Document, BindingsDefinition } from './domain/Document.js';
export type { Section, ParagraphSection, GridSection, GridSectionContent } from './domain/Section.js';

// DATA VALUES
export type { DataValue, PrimitiveValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue } from './domain/data/DataValue.js';

// COMPONENTS
export type { ComponentRegistry, ScribeComponentProps } from './registry/ComponentRegistry.js';
export type { DefaultComponents } from './registry/defaultRegistry.js';
export type { BaseComponent, InlineComponent, BlockComponent } from './domain/components/Component.js';
export type { TextComponent, TextInputComponent, ImageComponent, LatexComponent, TableComponent, TableCellIndex } from './domain/components/DefaultComponents.js';


declare global {
    interface HTMLElementTagNameMap {
        'scribe-interpreter': HTMLElement & {
            id?: string;
            class?: string;
            style?: string;
            document: Document;
            registry?: ComponentRegistry;
            mode?: ScribeMode;
			ondocumentchange?: (event: CustomEvent<Document>) => void;
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace svelteHTML {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps;
        }
    }

    namespace JSX {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps & {
                id?: string;
                class?: string;
                style?: string;
                [key: string]: any;
            };
        }
    }
}
