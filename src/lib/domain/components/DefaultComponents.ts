import type { BindingValue, NumberValue, StringValue } from "../data/DataValue.ts";
import type { BlockComponent, InlineComponent } from "./Component.ts";

/** Shows a line of text accepting primitive or binding to an specific value */
export type TextComponent = InlineComponent<'text', StringValue | NumberValue | BindingValue>;

/** Shows a text input field */
export type TextInputComponent = InlineComponent<'text-input', BindingValue>;

/** Shows an image from the web */
export type ImageComponent = BlockComponent<'image', StringValue | BindingValue>;
