import type { Document } from './domain/Document.js';
import type { ComponentRegistry } from './registry/ComponentRegistry.js';
import type { ScribeProps } from './types/ScribeProps.js';

// COMPONENTS
export { default as Scribe } from './components/Scribe.svelte';
export { defaultRegistry } from './registry/defaultRegistry.js';

// TYPES
export type { ScribeProps } from './types/ScribeProps.js';

// DOCUMENT STRUCTURE
export type { Document, BindingsDefinition } from './domain/Document.js';
export type { Section, ParagraphSection, BlockSection, GridSection, GridSectionContent } from './domain/Section.js';

// DATA VALUES
export type { DataValue, PrimitiveValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue } from './domain/data/DataValue.js';

// COMPONENTS
export type { ComponentRegistry, ScribeComponentProps } from './registry/ComponentRegistry.js';
export type { DefaultComponents } from './registry/defaultRegistry.js';
export type { BaseComponent, InlineComponent, BlockComponent } from './domain/components/Component.js';
export type { TextComponent, TextInputComponent } from './domain/components/DefaultComponents.js';


declare global {
    interface HTMLElementTagNameMap {
        'scribe-interpreter': HTMLElement & {
            id?: string;
            class?: string;
            style?: string;
            document: Document;
            registry?: ComponentRegistry;
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace svelteHTML {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps;
        }
    }
}
