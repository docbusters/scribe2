import type { BaseComponent } from "../domain/components/Component.js";
import type { CollectionValue, DataValue, PrimitiveValue } from "../domain/data/DataValue.js";
import type { Document, BindingsDefinition } from "../domain/Document.js";
import type { ComponentRegistry } from "../registry/ComponentRegistry.js";

export type ScribeMode = "edit" | "view";

export interface ScribeProps<C extends BaseComponent<string, DataValue> = never> {
    id?: string;
    class?: string;
    style?: string;
    mode?: ScribeMode;
    /** Initial document value. Changes made in the document while in edit mode will be notified via the `ondocumentchange` event. */
    document: Document<C>;
    bindings?: Record<string, BindingsDefinition>;
    registry?: ComponentRegistry<C>;
    customBindings?: Record<string, CustomBinding>;
    ondocumentchange?: (event: CustomEvent<Document<C>>) => void;
    onbindingchange?: (event: CustomEvent<BindingChangeEventDetail>) => void;
    /** Current language / locale for the interface ('en' or 'es'). Defaults to 'en'. */
    lang?: 'en' | 'es';
    /** Whether to display the built-in floating variables/bindings panel in edit mode. Defaults to true. */
    showBindingsPanel?: boolean;
    /** Whether to display the button that prints the document to the console in edit mode. Defaults to false. */
    showPrintButton?: boolean;
}

export interface CustomBindingSubscribable {
    value: PrimitiveValue | CollectionValue;
    /** Subscribes to value changes and returns an unsubscribe function */
    subscribe: (update: (newValue: PrimitiveValue | CollectionValue) => void) => () => void;
}

export interface CustomBinding {
    type: string;
    name: string;
    /** Optional description displayed in value selectors and cards */
    description?: string;
    /** Returns the available ids and their labels for the editor */
    getAvailableIds: () => { id: string; label: string; type: string }[];
    /** Returns the static value or a subscribable value object */
    getData: (id: string) => Promise<PrimitiveValue | CollectionValue> | CustomBindingSubscribable;
    /**
     * Draws the content of each row of this binding in the value selector, instead of the default one (type icon, title, value preview and type).
     * Scribe keeps the row itself: the button, its selection, the disabled state, the focus, the keyboard and the search
     */
    renderItem?: BindingItemRenderer;
}

/** What Scribe tells the renderer of a row of a custom binding. It is plain data: nothing here is a Svelte value or a store */
export interface BindingItemProps {
    /** Id of the item, as returned by `getAvailableIds` */
    id: string;
    /** Label of the item, which is its id when `getAvailableIds` gives none */
    label: string;
    /** Type of the value of the item, as returned by `getAvailableIds` */
    type: string;
    /** Key of the custom binding the item belongs to */
    bindingType: string;
    /** The value of the item once loaded. Undefined while it loads, or when it could not be loaded */
    value: PrimitiveValue | CollectionValue | undefined;
    /** The value as text, which is what the default row shows. Empty while it loads */
    preview: string;
    isLoading: boolean;
    /** The component that is being edited does not support the type of the item, so the row cannot be chosen */
    isDisabled: boolean;
    isSelected: boolean;
}

/** What a renderer hands back to Scribe: how to give it the new props of the row and how to clean up. Both are optional */
export interface BindingItemRendererHandle {
    update?: (props: BindingItemProps) => void;
    destroy?: () => void;
}

/**
 * Draws the content of a row into `node` and returns how to update and clean it up. It does not depend on any framework: with React it is
 * `createRoot(node)` and `root.render` (in `update` too) and `root.unmount` in `destroy`. `update` runs again when the value loads or the
 * selection changes. The row is a button, so the content must not hold buttons or links. If the renderer throws, the row falls back to the default content
 */
export type BindingItemRenderer = (node: HTMLElement, props: BindingItemProps) => BindingItemRendererHandle | void;

/** 
 * The type of update that occurred. 
 * onchange: The value has updated but the user has not finished interacting with the input.
 * onblur: The user has finished interacting with the input and the value is finalized.
 */
export type UpdateType = 'onchange' | 'onblur';

/** A new binding definition has been created */
export interface BindingDefinitionCreate {
    type: 'binding_create';
    id: string;
    definition: BindingsDefinition;
}

/** A binding definition has been updated, most likely its initial value */
export interface BindingDefinitionUpdate {
    type: 'binding_update';
    updateType: UpdateType;
    id: string;
    definition: BindingsDefinition;
}

/** A binding definition has been deleted */
export interface BindingDefinitionDelete {
    type: 'binding_delete';
    id: string;
}

/** A custom binding value has been updated */
export interface CustomBindingValueUpdate {
    type: 'value_update';
    updateType: UpdateType;
    bindingType: string;
    id: string;
    value: PrimitiveValue | CollectionValue;
}

export type BindingChangeEventDetail =
    | CustomBindingValueUpdate
    | BindingDefinitionUpdate
    | BindingDefinitionCreate
    | BindingDefinitionDelete;
