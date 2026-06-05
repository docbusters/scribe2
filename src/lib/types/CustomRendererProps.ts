import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";
import type { ScribeMode } from "./ScribeProps.ts";

export interface ComponentRendererProps {
    componentData: BaseComponent<string, DataValue, ComponentConfig | undefined>;
    sectionId: string;
    mode: ScribeMode; 
    disabledOptions?: string[];
}
