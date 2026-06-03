import type { BindingsDefinition, Document } from './domain/Document.js';
import type { CustomBinding, ScribeMode, ScribeProps } from './types/ScribeProps.js';
import ScribeComponent from './components/Scribe.svelte';
import ComponentRendererSvelte from './components/component/ComponentRenderer.svelte';
import type { ComponentRendererProps } from './types/CustomRendererProps.ts';
import type { Component } from 'svelte';

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
import type { DataValue, PrimitiveValue, CollectionValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue } from './domain/data/DataValue.js';
export type { DataValue, PrimitiveValue, CollectionValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue };

// COMPONENTS
import type { ComponentRegistry, ScribeComponentProps } from './registry/ComponentRegistry.js';
export type { ComponentRegistry, ScribeComponentProps };

import type { DefaultComponents } from './registry/defaultRegistry.js';
export type { DefaultComponents };

import type { BaseComponent, InlineComponent, BlockComponent, ComponentConfig } from './domain/components/Component.js';
export type { BaseComponent, InlineComponent, BlockComponent, ComponentConfig };

import type { TextComponent, TextInputComponent, ImageComponent, LatexComponent, TableComponent, MapComponent, TableCellIndex } from './domain/components/DefaultComponents.js';
export type { TextComponent, TextInputComponent, ImageComponent, LatexComponent, TableComponent, MapComponent, TableCellIndex };

import TextComponentSvelte from './components/defaultComponents/TextComponentScribe.svelte';
import TextInputComponentSvelte from './components/defaultComponents/TextInputComponentScribe.svelte';
import ImageComponentSvelte from './components/defaultComponents/ImageComponentScribe.svelte';
import LatexComponentSvelte from './components/defaultComponents/LatexComponentScribe.svelte';
import TableComponentSvelte from './components/defaultComponents/TableComponentScribe.svelte';

export const TextComponentScribe = TextComponentSvelte as Component<ScribeComponentProps<TextComponent>>;
export const TextInputComponentScribe = TextInputComponentSvelte as Component<ScribeComponentProps<TextInputComponent>>;
export const ImageComponentScribe = ImageComponentSvelte as Component<ScribeComponentProps<ImageComponent>>;
export const LatexComponentScribe = LatexComponentSvelte as Component<ScribeComponentProps<LatexComponent>>;
export const TableComponentScribe = TableComponentSvelte as Component<ScribeComponentProps<TableComponent>>;

// UTILS
export const ComponentRenderer = ComponentRendererSvelte as Component<ComponentRendererProps>;

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
