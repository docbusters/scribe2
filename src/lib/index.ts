import type { BindingsDefinition, Document } from './domain/Document.js';
import type { ComponentRegistry } from './registry/ComponentRegistry.js';
import type { CustomBinding, ScribeMode, ScribeProps } from './types/ScribeProps.js';

import ScribeComponent from './components/Scribe.svelte';
import ComponentRenderer from './components/component/ComponentRenderer.svelte';

// COMPONENTS
export interface ScribeConstructor {
    new (): HTMLElement & ScribeProps;
    prototype: HTMLElement & ScribeProps;
}

export const Scribe = ScribeComponent as unknown as ScribeConstructor;
export { defaultRegistry } from './registry/defaultRegistry.js';

// TYPES
export type { ScribeProps, CustomBinding, ScribeMode } from './types/ScribeProps.js';

// DOCUMENT STRUCTURE
export type { Document, BindingsDefinition } from './domain/Document.js';
export type { Section, ParagraphSection, GridSection, GridSectionContent } from './domain/Section.js';

// DATA VALUES
export type { DataValue, PrimitiveValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue } from './domain/data/DataValue.js';

// COMPONENTS
export type { ComponentRegistry, ScribeComponentProps } from './registry/ComponentRegistry.js';
export type { DefaultComponents } from './registry/defaultRegistry.js';
export type { BaseComponent, InlineComponent, BlockComponent, ComponentConfig } from './domain/components/Component.js';
export type { TextComponent, TextInputComponent, ImageComponent, LatexComponent, TableComponent, TableCellIndex } from './domain/components/DefaultComponents.js';

// UTILS
export { ComponentRenderer };

declare global {
    interface HTMLElementTagNameMap {
        'scribe-interpreter': HTMLElement & {
            id?: string;
            class?: string;
            style?: string;
            document: Document;
            registry?: ComponentRegistry;
            mode?: ScribeMode;
            bindings?: Record<string, BindingsDefinition>;
            customBindings?: Record<string, CustomBinding>;
			ondocumentchange?: (event: CustomEvent<Document>) => void;
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace svelteHTML {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
        }
    }
}
