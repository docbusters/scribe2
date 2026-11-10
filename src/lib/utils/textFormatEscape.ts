import { BOLD_CHAR, ESCAPE_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../constants/DocumentConstants.js';

// Built from the constants, so the characters that are escaped are always the ones that mean something in a text
const SPECIAL_CHARS = new Set([ESCAPE_CHAR, BOLD_CHAR, ITALIC_CHAR, UNDERLINE_CHAR, STRIKETHROUGH_CHAR]);

/** Makes the characters of a text literal, so none of them is read as a format character when the text is parsed */
export function escapeSpecialChars(text: string): string {
    let result = '';
    for (const char of text) {
        result += SPECIAL_CHARS.has(char) ? ESCAPE_CHAR + char : char;
    }
    return result;
}

/**
 * Removes the pairs of the given format character that are next to each other, as they toggle the format on and off
 * around nothing. Escaped characters are literal text, so they never take part in a pair
 */
export function removeEmptyToggles(text: string, char: string): string {
    // An escaped character is a single token, so it is never equal to the unescaped format character
    const tokens: string[] = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ESCAPE_CHAR && i + 1 < text.length) {
            tokens.push(text.slice(i, i + 2));
            i++;
        } else if (text[i] === char && tokens[tokens.length - 1] === char) {
            tokens.pop();
        } else {
            tokens.push(text[i]);
        }
    }
    return tokens.join('');
}
