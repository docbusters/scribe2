import type { NumberValue, StringValue } from "../data/DataValue.ts";
import type { InlineComponent } from "./Component.ts";

export type TextComponent = InlineComponent<'text', StringValue | NumberValue>;
