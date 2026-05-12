import type { BindingValue, NumberValue, StringValue } from "../data/DataValue.ts";
import type { BlockComponent, InlineComponent } from "./Component.ts";
import type { ImageComponentConfig, LatexComponentConfig, TableComponentConfig, TextInputComponentConfig } from "./DefaultComponentsConfig.ts";

/** Shows a line of text accepting primitive or binding to an specific value */
export type TextComponent = InlineComponent<'text', StringValue | NumberValue | BindingValue>;

/** Shows a text input field */
export type TextInputComponent = InlineComponent<'text-input', BindingValue, TextInputComponentConfig>;

/** Shows an image from the web */
export type ImageComponent = BlockComponent<'image', StringValue | BindingValue, ImageComponentConfig>;

/** Renders latex content */
export type LatexComponent = BlockComponent<'latex', StringValue | BindingValue, LatexComponentConfig>;

/** Renders a table */
export type TableComponent = BlockComponent<'table', StringValue | BindingValue, TableComponentConfig>;
