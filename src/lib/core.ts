// The entry `@antonii22/scribe2/core`: everything of the library that has no effect when it is imported, so it can be imported in a
// Node unit test (no DOM) and shaken by a bundler. The custom elements are registered by the main entry (`index.ts`), never from here
import type { ScribeProps, CustomBinding } from './types/ScribeProps.js';
import type { ComponentSlotProps } from './types/ComponentSlotProps.js';
import type { Document, BindingsDefinition } from './domain/Document.js';
import type { CustomBindingUsages } from './utils/bindingUsages.js';

// COMPONENTS
export interface ScribeInterpreterElement<C extends BaseComponent<string, DataValue> = never> extends HTMLElement, Omit<ScribeProps<C>, 'style' | 'id' | 'class' | 'lang'> {
    getCustomBindingUsages(): CustomBindingUsages;
    refreshDocument(newDocument: Document<C>): void;
    refreshBindings(newBindings: Record<string, BindingsDefinition>): void;
    refreshCustomBindings(newCustomBindings: Record<string, CustomBinding>): void;
}

export interface ScribeConstructor {
    new (): ScribeInterpreterElement;
    prototype: ScribeInterpreterElement;
}

export { defaultRegistry, getDefaultRegistry } from './registry/defaultRegistry.js';
export { createColorOption } from './registry/colorOption.js';
export type { ColorOptionDefinition } from './registry/colorOption.js';
export type { BindingsPanelProps } from './types/BindingsPanelProps.js';

// TYPES
export type { ScribeProps, DocumentChangeDetail, CustomBinding, CustomBindingSubscribable, BindingItemProps, BindingItemRenderer, BindingItemRendererHandle, ScribeMode, BindingChangeEventDetail, BindingDefinitionCreate, BindingDefinitionUpdate, BindingDefinitionDelete, CustomBindingValueUpdate } from './types/ScribeProps.js';

// i18n
export * from './i18n/index.js';

// DOCUMENT STRUCTURE
export type { Document, BindingsDefinition } from './domain/Document.js';
export type { Section } from './domain/Section.js';
export type { CustomBindingUsages } from './utils/bindingUsages.js';

// DATA VALUES
import type { DataValue, PrimitiveValue, CollectionValue, EmptyValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue } from './domain/data/DataValue.js';
export type { DataValue, PrimitiveValue, CollectionValue, EmptyValue, StringValue, NumberValue, BindingValue, BooleanValue, DateValue, ArrayValue, ComponentValue, RecordValue };

// COMPONENTS
import type { ComponentRegistry, ScribeComponentProps } from './registry/ComponentRegistry.js';
export type { ComponentRegistry, ScribeComponentProps };

import type { DefaultComponents } from './registry/defaultRegistry.js';
export type { DefaultComponents };

import type { BaseComponent, InlineComponent, BlockComponent, ComponentConfig, SlotRef } from './domain/components/Component.js';
export type { BaseComponent, InlineComponent, BlockComponent, ComponentConfig, SlotRef };

// SLOTS. A slot is drawn with the custom element <scribe-component-slot>: the Svelte components of the bundle are compiled against its own
// copy of the Svelte runtime, so they cannot be rendered inside the components of a host (see "Slots" in the README)
export type { ComponentSlotProps };

import type { TextComponent, TextInputComponent, ImageComponent, VideoComponent, QrComponent, LatexComponent, TableComponent, MapComponent, TableCellIndex } from './domain/components/DefaultComponents.js';
export type { TextComponent, TextInputComponent, ImageComponent, VideoComponent, QrComponent, LatexComponent, TableComponent, MapComponent, TableCellIndex };

// FOCUS NAVIGATION
export {
    handleArrowNavigation,
    setupFocusListeners,
    navigateToAdjacentComponent
} from './utils/focusNavigation.js';
export type { FocusNavigationDetail } from './utils/focusNavigation.js';
