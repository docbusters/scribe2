import { describe, expect, it } from 'vitest';
import { getFormatsInRange, toggleTextFormat, tokenizeFormattedText } from './textFormat.js';
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

const ALPHABET = ['a', 'b', ' ', '*', '_', '~', '-', BS, '😀'];

function randomString(random: () => number, maxLength = 10) {
    const length = Math.floor(random() * (maxLength + 1));
    let result = '';
    for (let i = 0; i < length; i++) result += ALPHABET[Math.floor(random() * ALPHABET.length)];
    return result;
}

const visibleText = (stored: string) => tokenizeFormattedText(stored).tokens.map((token) => token.text).join('');

describe('escapeSpecialChars', () => {
    const fixed = ['', 'plain', '*', '_', '~', '-', BS, '*_~-' + BS, 'a * b _ c ~ d - e ' + BS + ' f', BS + BS, 'ends with ' + BS];

    it('reads back as the same visible text, with no format on', () => {
        for (const text of fixed) {
            const { tokens, end } = tokenizeFormattedText(escapeSpecialChars(text));
            expect(tokens.map((token) => token.text).join('')).toBe(text);
            for (const token of tokens) {
                expect([token.bold, token.italic, token.underline, token.strikethrough]).toEqual([false, false, false, false]);
            }
            expect(Object.values(end)).not.toContain(true);
        }
    });

    it('reads back as the same visible text for random strings', () => {
        const random = createRandom(1);
        for (let i = 0; i < 500; i++) {
            const text = randomString(random);
            const { tokens } = tokenizeFormattedText(escapeSpecialChars(text));
            expect(tokens.map((token) => token.text).join(''), JSON.stringify(text)).toBe(text);
            expect(tokens.some((token) => token.bold || token.italic || token.underline || token.strikethrough), JSON.stringify(text)).toBe(false);
        }
    });
});

describe('tokenizeFormattedText', () => {
    it('gives one empty token for an empty text', () => {
        expect(tokenizeFormattedText('').tokens).toEqual([{ text: '', bold: false, italic: false, strikethrough: false, underline: false }]);
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
