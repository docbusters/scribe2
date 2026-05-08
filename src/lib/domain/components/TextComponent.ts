import type { BindingValue, NumberValue, StringValue } from "../data/DataValue.js";
import type { InlineComponent } from "./Component.js";

/** Shows a line of text accepting primitive or binding to an specific value */
export type TextComponent = InlineComponent<'text', StringValue | NumberValue | BindingValue>;
