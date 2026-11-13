import type { BaseComponent, ComponentConfig } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
import type { ScribeMode } from "./ScribeProps.ts";

export interface ComponentSlotProps {
    /** The component that holds the slot. Its value must be a record, and the slot is the entry `slotKey` of it */
    componentData: BaseComponent<string, DataValue, ComponentConfig | undefined>;
    /** Key of the slot in the record value of the component. Every key is a different slot */
    slotKey: string;
    sectionId: string;
    mode: ScribeMode;
    isDarkMode: boolean;
}
