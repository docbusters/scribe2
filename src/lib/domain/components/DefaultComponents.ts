import type { ArrayValue, BindingValue, ComponentValue, NumberValue, RecordValue, StringValue } from "../data/DataValue.ts";
import type { BlockComponent, InlineComponent } from "./Component.ts";
import type { ChartComponentConfig, ImageComponentConfig, LatexComponentConfig, MapComponentConfig, QrComponentConfig, TableComponentConfig, TextInputComponentConfig } from "./DefaultComponentsConfig.ts";

/** Shows a line of text accepting a string value */
export type TextComponent = InlineComponent<'text', StringValue>;

/** Shows a line of text that can be binded */
export type TextBindingComponent = InlineComponent<'text-binding', BindingValue>;

/** Shows a text input field */
export type TextInputComponent = InlineComponent<'text-input', BindingValue, TextInputComponentConfig>;

/** Shows a checkbox bound to a boolean variable */
export type CheckboxComponent = InlineComponent<'checkbox', BindingValue>;

/** Shows an image from the web */
export type ImageComponent = BlockComponent<'image', StringValue | BindingValue, ImageComponentConfig>;

/** Embeds a video from a link to YouTube or Vimeo */
export type VideoComponent = BlockComponent<'video', StringValue | BindingValue>;

/** Draws a QR code of a text, usually a URL */
export type QrComponent = BlockComponent<'qr', StringValue | BindingValue, QrComponentConfig>;

/** Renders latex content */
export type LatexComponent = BlockComponent<'latex', StringValue | BindingValue, LatexComponentConfig>;

/** Renders a table. Every cell is a slot: it holds components like a section, keyed by their ids */
export type TableComponent = BlockComponent<'table', RecordValue<TableCellIndex, RecordValue<string, ComponentValue>>, TableComponentConfig>;
/** Key of a cell, as `row:col` */
export type TableCellIndex = `${number}:${number}`;

/** Renders an interactive map */
export type MapComponent = BlockComponent<'map', RecordValue<'latitude' | 'longitude' | 'address', NumberValue | StringValue> | BindingValue, MapComponentConfig>;

/** Renders a chart */
export type ChartComponent = BlockComponent<'chart', ArrayValue<RecordValue<string, StringValue | NumberValue>>  | BindingValue, ChartComponentConfig>;
