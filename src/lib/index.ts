// Reexport your entry components here

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
