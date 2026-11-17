import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPickerSession, isBindingTypeAccepted } from './bindingPicker.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('isBindingTypeAccepted', () => {
    it('accepts an item with no type, or a component that restricts nothing', () => {
        expect(isBindingTypeAccepted(undefined, ['string'])).toBe(true);
        expect(isBindingTypeAccepted('', ['string'])).toBe(true);
        expect(isBindingTypeAccepted('number', undefined)).toBe(true);
        expect(isBindingTypeAccepted('number', [])).toBe(true);
    });

    it('accepts only the supported types, ignoring "binding" in the list', () => {
        expect(isBindingTypeAccepted('string', ['string', 'number'])).toBe(true);
        expect(isBindingTypeAccepted('boolean', ['string', 'number'])).toBe(false);
        // A list with only "binding" restricts nothing, as before
        expect(isBindingTypeAccepted('boolean', ['binding'])).toBe(true);
    });
});

describe('createPickerSession', () => {
    const available = [
        { value: 'B3' },
        { value: 'B4', disabled: true },
        { value: 'B5', disabled: false }
    ];

    function setup() {
        const onPick = vi.fn();
        const onClose = vi.fn();
        const session = createPickerSession({ getAvailable: () => available, onPick, onClose });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        return { session, onPick, onClose };
    }

    it('hands a valid id to onPick, then leaves the picker', () => {
        const { session, onPick, onClose } = setup();
        const order: string[] = [];
        onPick.mockImplementation(() => order.push('pick'));
        onClose.mockImplementation(() => order.push('close'));

        session.select('B3');

        expect(onPick).toHaveBeenCalledWith('B3');
        expect(order).toEqual(['pick', 'close']);
    });

    it('ignores an unknown id, a disabled item and a value that is not a string, and the picker stays open', () => {
        const { session, onPick, onClose } = setup();

        session.select('Z99');
        session.select('B4');
        session.select(undefined as unknown as string);
        session.select(42 as unknown as string);

        expect(onPick).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        // It still works afterwards
        session.select('B5');
        expect(onPick).toHaveBeenCalledWith('B5');
    });

    it('reads the available items on every select, so it follows what the host adds', () => {
        const items = [{ value: 'A1' }];
        const onPick = vi.fn();
        const session = createPickerSession({ getAvailable: () => items, onPick, onClose: () => {} });
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        session.select('A2');
        items.push({ value: 'A2' });
        session.select('A2');

        expect(onPick).toHaveBeenCalledOnce();
        expect(onPick).toHaveBeenCalledWith('A2');
    });

    it('leaves without choosing on cancel', () => {
        const { session, onPick, onClose } = setup();

        session.cancel();

        expect(onPick).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('does nothing after the picker is left, so a stale handle of the host cannot change the choice', () => {
        const { session, onPick, onClose } = setup();

        session.select('B3');
        session.select('B5');
        session.cancel();

        expect(onPick).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('does not call anything once closed from outside', () => {
        const { session, onPick, onClose } = setup();

        session.close();
        session.select('B3');
        session.cancel();

        expect(onPick).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
