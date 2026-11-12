import { describe, expect, it } from 'vitest';
import { getFormatsInRange, setTextColor, toggleTextFormat, tokenizeFormattedText } from './textFormat.js';
import { escapeSpecialChars, removeEmptyToggles } from './textFormatEscape.js';

const BS = String.fromCharCode(92); // The escape character, written without a backslash literal to avoid editing mistakes

/** Small seeded generator (mulberry32), so a failing input is the same on every run */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const ALPHABET = ['a', 'b', ' ', '*', '_', '~', '-', BS, '😀', '{', '#', '}'];

function randomString(random: () => number, maxLength = 10) {
    const length = Math.floor(random() * (maxLength + 1));
    let result = '';
    for (let i = 0; i < length; i++) result += ALPHABET[Math.floor(random() * ALPHABET.length)];
    return result;
}

const visibleText = (stored: string) => tokenizeFormattedText(stored).tokens.map((token) => token.text).join('');

describe('escapeSpecialChars', () => {
    const fixed = ['', 'plain', '*', '_', '~', '-', BS, '*_~-' + BS, 'a * b _ c ~ d - e ' + BS + ' f', BS + BS, 'ends with ' + BS, '{', '{#}', '{#ef4444}x', '{}', '{abc}'];

    it('reads back as the same visible text, with no format on', () => {
        for (const text of fixed) {
            const { tokens, end } = tokenizeFormattedText(escapeSpecialChars(text));
            expect(tokens.map((token) => token.text).join('')).toBe(text);
            for (const token of tokens) {
                expect([token.bold, token.italic, token.underline, token.strikethrough, token.color]).toEqual([false, false, false, false, null]);
            }
            expect(Object.values(end)).not.toContain(true);
            expect(end.color).toBeNull();
        }
    });

    it('reads back as the same visible text for random strings', () => {
        const random = createRandom(1);
        for (let i = 0; i < 500; i++) {
            const text = randomString(random);
            const { tokens } = tokenizeFormattedText(escapeSpecialChars(text));
            expect(tokens.map((token) => token.text).join(''), JSON.stringify(text)).toBe(text);
            expect(tokens.some((token) => token.bold || token.italic || token.underline || token.strikethrough || token.color), JSON.stringify(text)).toBe(false);
        }
    });
});

describe('tokenizeFormattedText', () => {
    it('gives one empty token for an empty text', () => {
        expect(tokenizeFormattedText('').tokens).toEqual([{ text: '', bold: false, italic: false, strikethrough: false, underline: false, color: null }]);
    });

    it('reads the colour markers, which are not visible', () => {
        const { tokens, end } = tokenizeFormattedText('a{#EF4444}b{#}c');
        expect(tokens.map((token) => [token.text, token.color])).toEqual([['a', null], ['b', '#ef4444'], ['c', null]]);
        expect(end.color).toBeNull();
        expect(tokenizeFormattedText('{#ef4444}a').end.color).toBe('#ef4444');
    });

    it('keeps a colour and the toggles independent of each other', () => {
        const { tokens } = tokenizeFormattedText('*a{#ef4444}b*c{#}');
        expect(tokens.map((token) => [token.text, token.bold, token.color])).toEqual([['a', true, null], ['b', true, '#ef4444'], ['c', false, '#ef4444']]);
    });

    it('reads a brace that is not a marker as literal text', () => {
        for (const literal of ['{', '{}', '{abc}', '{#ef444}', '{#ef44444}', '{#gggggg}', '{#ef4444', BS + '{#ef4444}']) {
            const { tokens } = tokenizeFormattedText(literal);
            expect(tokens.every((token) => token.color === null), literal).toBe(true);
        }
        expect(visibleText('{}')).toBe('{}');
        expect(visibleText('{#gggggg}')).toBe('{#gggggg}');
        expect(visibleText(BS + '{#ef4444}')).toBe('{#ef4444}');
    });

    it('ends a colour at the end of its line', () => {
        const { tokens, end } = tokenizeFormattedText('{#ef4444}a\nb');
        expect(tokens.map((token) => [token.text, token.color])).toEqual([['a\n', '#ef4444'], ['b', null]]);
        expect(end.color).toBeNull();
    });

    it('reads an escaped format character as literal text', () => {
        expect(visibleText(BS + '*')).toBe('*');
        expect(tokenizeFormattedText(BS + '*').tokens.every((token) => !token.bold)).toBe(true);
    });

    it('reads a trailing escape character as literal text', () => {
        expect(visibleText('a' + BS)).toBe('a' + BS);
    });

    it('splits a text where the format changes', () => {
        const { tokens } = tokenizeFormattedText('*a*b');
        expect(tokens.map((token) => [token.text, token.bold])).toEqual([['a', true], ['b', false]]);
    });

    it('reports the formats that are on after the last character', () => {
        expect(tokenizeFormattedText('*a').end.bold).toBe(true);
        expect(tokenizeFormattedText('*a*').end.bold).toBe(false);
    });
});

describe('removeEmptyToggles', () => {
    it('removes a pair of format characters around nothing', () => {
        expect(removeEmptyToggles('a**b', '*')).toBe('ab');
    });

    it('keeps an escaped format character, as it is literal text', () => {
        expect(removeEmptyToggles(BS + '**', '*')).toBe(BS + '**');
    });
});

describe('toggleTextFormat', () => {
    it('applies bold to the fragment and removes it again, keeping the text', () => {
        const random = createRandom(2);
        for (let i = 0; i < 500; i++) {
            const text = randomString(random);
            const stored = escapeSpecialChars(text);
            const length = text.length;
            if (length === 0) continue;

            const start = Math.floor(random() * length);
            const end = start + 1 + Math.floor(random() * (length - start));
            const label = JSON.stringify({ text, start, end });

            const bolded = toggleTextFormat(stored, start, end, 'bold', false);
            expect(visibleText(bolded), label).toBe(text);
            expect(getFormatsInRange(bolded, start, end).bold, label).toBe(true);

            const unbolded = toggleTextFormat(bolded, start, end, 'bold', true);
            expect(visibleText(unbolded), label).toBe(text);
            expect(getFormatsInRange(unbolded, start, end).bold, label).toBe(false);
            // Nothing else was ever formatted, so the stored string is back to the original
            expect(unbolded, label).toBe(stored);
        }
    });

    it('does not change the other formats of the fragment', () => {
        const random = createRandom(3);
        const others = ['italic', 'underline', 'strikethrough'] as const;
        for (let i = 0; i < 300; i++) {
            const text = randomString(random);
            const length = text.length;
            if (length === 0) continue;

            const start = Math.floor(random() * length);
            const end = start + 1 + Math.floor(random() * (length - start));
            const stored = escapeSpecialChars(text);
            const italic = toggleTextFormat(stored, start, end, 'italic', false);
            const both = toggleTextFormat(italic, start, end, 'bold', false);
            const label = JSON.stringify({ text, start, end });

            const formats = getFormatsInRange(both, start, end);
            expect(formats.italic, label).toBe(true);
            for (const other of others.filter((name) => name !== 'italic')) {
                expect(formats[other], label).toBe(false);
            }
            expect(visibleText(both), label).toBe(text);
        }
    });
});

describe('getFormatsInRange with colours', () => {
    it('gives the colour that the whole fragment has', () => {
        expect(getFormatsInRange('a{#ef4444}bc{#}d', 1, 3).color).toBe('#ef4444');
        expect(getFormatsInRange('a{#ef4444}bc{#}d', 0, 1).color).toBeNull();
    });

    it('gives no colour when the fragment has several', () => {
        expect(getFormatsInRange('a{#ef4444}b{#22c55e}c', 0, 3).color).toBeNull();
        expect(getFormatsInRange('a{#ef4444}b{#22c55e}c', 1, 3).color).toBeNull();
        expect(getFormatsInRange('{#ef4444}a{#}b{#ef4444}c', 0, 3).color).toBeNull();
    });

    it('gives the colour at the end of the text for a fragment with no characters', () => {
        expect(getFormatsInRange('a{#ef4444}b', 1, 1).color).toBe('#ef4444');
    });
});

describe('setTextColor', () => {
    const red = '#ef4444';
    const green = '#22c55e';

    it('colours a fragment and leaves the rest as it was', () => {
        expect(setTextColor('abc', 1, 2, red)).toBe('a{#ef4444}b{#}c');
        // Nothing visible follows, so there is nothing to go back to the theme colour for
        expect(setTextColor('abc', 0, 3, red)).toBe('{#ef4444}abc');
        expect(setTextColor('abc', 0, 1, red)).toBe('{#ef4444}a{#}bc');
    });

    it('writes the colour in lowercase', () => {
        expect(setTextColor('abc', 0, 1, '#EF4444')).toBe('{#ef4444}a{#}bc');
    });

    it('replaces the colours inside the fragment and keeps the one around it', () => {
        expect(setTextColor('a{#ef4444}bc{#}d', 0, 4, green)).toBe('{#22c55e}abcd');
        // The fragment is inside a coloured run: the colour is set for it and the run goes on after it
        expect(setTextColor('{#ef4444}abcd', 1, 3, green)).toBe('{#ef4444}a{#22c55e}bc{#ef4444}d');
        // The fragment starts inside a coloured run and ends after it
        expect(setTextColor('a{#ef4444}bc{#}d', 2, 4, green)).toBe('a{#ef4444}b{#22c55e}cd');
    });

    it('removes the colour with null', () => {
        expect(setTextColor('{#ef4444}abc{#}', 0, 3, null)).toBe('abc');
        expect(setTextColor('{#ef4444}abc', 1, 2, null)).toBe('{#ef4444}a{#}b{#ef4444}c');
        expect(setTextColor('abc', 0, 3, null)).toBe('abc');
    });

    it('writes no marker that changes nothing', () => {
        expect(setTextColor('{#ef4444}abc', 0, 3, red)).toBe('{#ef4444}abc');
        expect(setTextColor('{#ef4444}a{#}b{#ef4444}c', 0, 3, red)).toBe('{#ef4444}abc');
    });

    it('keeps the toggles and counts only visible characters', () => {
        const stored = '*ab*c';
        const coloured = setTextColor(stored, 1, 3, red);
        expect(visibleText(coloured)).toBe('abc');
        expect(tokenizeFormattedText(coloured).tokens.map((token) => [token.text, token.bold, token.color])).toEqual([
            ['a', true, null],
            ['b', true, '#ef4444'],
            ['c', false, '#ef4444']
        ]);
    });

    it('treats an escaped character as one visible character', () => {
        const stored = escapeSpecialChars('a*b');
        const coloured = setTextColor(stored, 1, 2, red);
        expect(visibleText(coloured)).toBe('a*b');
        expect(tokenizeFormattedText(coloured).tokens.map((token) => [token.text, token.color])).toEqual([['a', null], ['*', '#ef4444'], ['b', null]]);
    });

    it('sets the colour again at the start of each line of the fragment', () => {
        expect(setTextColor('ab\ncd\nef', 1, 7, red)).toBe('a{#ef4444}b\n{#ef4444}cd\n{#ef4444}e{#}f');
        // A fragment that ends with a newline does not colour the next line
        expect(setTextColor('ab\ncd', 0, 3, red)).toBe('{#ef4444}ab\ncd');
    });

    it('does nothing for a fragment with no characters', () => {
        expect(setTextColor('abc', 1, 1, red)).toBe('abc');
    });

    it('keeps the visible text and gives the colour to the whole fragment for random texts', () => {
        const random = createRandom(4);
        for (let i = 0; i < 500; i++) {
            const text = randomString(random);
            const length = text.length;
            if (length === 0) continue;

            const start = Math.floor(random() * length);
            const end = start + 1 + Math.floor(random() * (length - start));
            const stored = escapeSpecialChars(text);
            const label = JSON.stringify({ text, start, end });

            const coloured = setTextColor(stored, start, end, red);
            expect(visibleText(coloured), label).toBe(text);
            expect(getFormatsInRange(coloured, start, end).color, label).toBe(red);

            const cleared = setTextColor(coloured, start, end, null);
            expect(visibleText(cleared), label).toBe(text);
            expect(getFormatsInRange(cleared, start, end).color, label).toBeNull();
            // Nothing else was ever coloured, so the stored string is back to the original
            expect(cleared, label).toBe(stored);
        }
    });
});

describe('toggleTextFormat on a coloured text', () => {
    it('counts the visible characters only', () => {
        const stored = 'a{#ef4444}bc{#}d';
        const bolded = toggleTextFormat(stored, 1, 3, 'bold', false);
        expect(visibleText(bolded)).toBe('abcd');
        expect(tokenizeFormattedText(bolded).tokens.map((token) => [token.text, token.bold, token.color])).toEqual([
            ['a', false, null],
            ['bc', true, '#ef4444'],
            ['d', false, null]
        ]);
    });

    it('returns the same text when the format is toggled on and off again', () => {
        const stored = '{#ef4444}ab{#}cd';
        const bolded = toggleTextFormat(stored, 1, 3, 'bold', false);
        expect(toggleTextFormat(bolded, 1, 3, 'bold', true)).toBe(stored);
    });
});
