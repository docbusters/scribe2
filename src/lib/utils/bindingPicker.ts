import type { DataValue } from '../domain/data/DataValue.js';

/**
 * Whether a custom item of this type can be chosen for a component that supports `supportedTypes`. An item with no type, or a component
 * that restricts nothing, accepts everything. It is the rule that disables the rows of the list, so the picker follows the same one
 */
export function isBindingTypeAccepted(type: string | undefined, supportedTypes?: Omit<DataValue['type'], 'binding'>[]): boolean {
    const allowed = supportedTypes?.filter((t) => t !== 'binding') ?? [];
    return !type || allowed.length === 0 || allowed.includes(type);
}

export interface PickerSessionOptions {
    /** The items that can be chosen right now. Read on every `select`, so it follows what the host adds or removes */
    getAvailable: () => { value: string; disabled?: boolean }[];
    /** Receives the validated id. It must only keep it as the pending choice: nothing is applied here */
    onPick: (id: string) => void;
    /** Leaves the picker, after a valid choice or a cancel */
    onClose: () => void;
}

export interface PickerSession {
    select: (id: string) => void;
    cancel: () => void;
    /** Ends the session without calling anything (the picker was left some other way). Later calls of the host do nothing */
    close: () => void;
}

/**
 * The functions the host receives as `select` and `cancel` in `BindingPickerProps`. `select` validates the id, as the host is not
 * trusted: an unknown id, a disabled item or a value that is not a string is ignored and the picker stays open. Once the session is
 * closed everything is a no-op, so a stale handle of the host cannot change the choice of a dialog that has moved on
 */
export function createPickerSession({ getAvailable, onPick, onClose }: PickerSessionOptions): PickerSession {
    let closed = false;

    const end = () => {
        closed = true;
        onClose();
    };

    return {
        select: (id) => {
            if (closed) return;
            const item = typeof id === 'string' ? getAvailable().find((candidate) => candidate.value === id) : undefined;
            if (!item || item.disabled) {
                console.warn(`[Scribe] The picker chose "${String(id)}", which is not an available item of this component, so it was ignored.`);
                return;
            }
            onPick(id);
            end();
        },
        cancel: () => {
            if (!closed) end();
        },
        close: () => {
            closed = true;
        }
    };
}
