import { describe, expect, it } from 'vitest';
import { compatibleFirst } from './compatibleFirst.js';

describe('compatibleFirst', () => {
    it('moves disabled items last and keeps the order inside each group', () => {
        const items = [
            { id: 'a', disabled: true },
            { id: 'b', disabled: false },
            { id: 'c', disabled: true },
            { id: 'd' },
            { id: 'e', disabled: false }
        ];
        expect(compatibleFirst(items).map((i) => i.id)).toEqual(['b', 'd', 'e', 'a', 'c']);
    });

    it('does not mutate the input', () => {
        const items = [{ disabled: true }, { disabled: false }];
        compatibleFirst(items);
        expect(items[0].disabled).toBe(true);
    });
});
