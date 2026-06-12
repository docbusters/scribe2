import type { ScribeProps, CustomBinding } from './types/ScribeProps.js';
import ScribeComponent from './components/Scribe.svelte';
import type { ComponentRendererProps } from './types/CustomRendererProps.ts';
import type { EmptyContentProps } from './types/EmptyContentProps.ts';
import type { Component } from 'svelte';
import type { Document, BindingsDefinition } from './domain/Document.js';

// COMPONENTS
export interface ScribeInterpreterElement<C extends BaseComponent<string, DataValue> = never> extends HTMLElement, Omit<ScribeProps<C>, 'style' | 'id' | 'class'> {
    refreshDocument(newDocument: Document<C>): void;
    refreshBindings(newBindings: Record<string, BindingsDefinition>): void;
    refreshCustomBindings(newCustomBindings: Record<string, CustomBinding>): void;
}

export interface ScribeConstructor {
    new (): ScribeInterpreterElement;
    prototype: ScribeInterpreterElement;
}

export const Scribe = ScribeComponent as unknown as ScribeConstructor;
export { defaultRegistry } from './registry/defaultRegistry.js';

// TYPES
export type { ScribeProps, CustomBinding, ScribeMode, BindingDefinitionUpdate, CustomBindingValueUpdate } from './types/ScribeProps.js';

// DOCUMENT STRUCTURE
export type { Document, BindingsDefinition } from './domain/Document.js';
export type { Section, ParagraphSection, GridSection, GridSectionContent } from './domain/Section.js';

// DATA VALUES
import type { DataValue, PrimitiveValue, CollectionValue, EmptyValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue } from './domain/data/DataValue.js';
export type { DataValue, PrimitiveValue, CollectionValue, EmptyValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue };

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

declare global {
    interface HTMLElementTagNameMap {
        'scribe-interpreter': ScribeInterpreterElement;
        'scribe-component-renderer': HTMLElement & ComponentRendererProps;
        'scribe-empty-content': HTMLElement & EmptyContentProps;
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace svelteHTML {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps;
            'scribe-component-renderer': ComponentRendererProps;
            'scribe-empty-content': EmptyContentProps;
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
            'scribe-component-renderer': ComponentRendererProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
            'scribe-empty-content': EmptyContentProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
        }
    }
}
