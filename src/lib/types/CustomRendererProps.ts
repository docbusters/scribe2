import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
import type { ScribeMode } from "./ScribeProps.ts";

export interface ComponentRendererProps {
    componentData: BaseComponent<string, DataValue, ComponentConfig | undefined>;
    sectionId: string;
    mode: ScribeMode; 
    disabledOptions?: string[];
    isDarkMode: boolean;
}
