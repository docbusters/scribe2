// The types of the main entry `@antonii22/scribe2` (its JavaScript is `scribe.ts`, which registers the custom elements when it is imported,
// and needs a DOM). Everything else is in `core.ts` (`@antonii22/scribe2/core`), which has no import effects
import type { ScribeConstructor, ScribeInterpreterElement } from './core.js';
import type { ScribeProps } from './types/ScribeProps.js';
import type { ComponentRendererProps } from './types/CustomRendererProps.js';
import type { ComponentSlotProps } from './types/ComponentSlotProps.js';
import type { EmptyContentProps } from './types/EmptyContentProps.js';
import type { BindingsPanelProps } from './types/BindingsPanelProps.js';

// The class of <scribe-interpreter>, created by the JavaScript entry (scribe.ts)
export declare const Scribe: ScribeConstructor;

// The types are re-exported for convenience: a type has no runtime, so it does not bring the effects of this entry
export type * from './core.js';

declare global {
    interface HTMLElementTagNameMap {
        'scribe-interpreter': ScribeInterpreterElement;
        'scribe-component-renderer': HTMLElement & ComponentRendererProps;
        'scribe-component-slot': HTMLElement & ComponentSlotProps;
        'scribe-empty-content': HTMLElement & EmptyContentProps;
        'scribe-bindings-panel': HTMLElement & BindingsPanelProps;
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace svelteHTML {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps;
            'scribe-component-renderer': ComponentRendererProps;
            'scribe-component-slot': ComponentSlotProps;
            'scribe-empty-content': EmptyContentProps;
            'scribe-bindings-panel': BindingsPanelProps;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'scribe-interpreter': ScribeProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
            'scribe-component-renderer': ComponentRendererProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
            'scribe-component-slot': ComponentSlotProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
            'scribe-empty-content': EmptyContentProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
            'scribe-bindings-panel': BindingsPanelProps & {
                id?: string;
                class?: string;
                style?: string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
            };
        }
    }
}
