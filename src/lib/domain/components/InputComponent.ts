import type { BindingValue } from "../data/DataValue.ts";
import type { InlineComponent } from "./Component.ts";

/** Shows a text input field */
export type TextInputComponent = InlineComponent<'text-input', BindingValue>;
