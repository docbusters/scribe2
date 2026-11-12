import { BOLD_CHAR, COLOR_CHAR, ESCAPE_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../constants/DocumentConstants.js';
import { removeEmptyToggles } from './textFormatEscape.js';
import { isHexColor } from './colorPalette.js';

export type TextFormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough';

export interface TextFormats {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    /** `#rrggbb` in lowercase. Null is the colour of the theme, and also a fragment whose characters have different colours */
    color: string | null;
}

const FORMAT_CHARS: Record<TextFormatCommand, string> = {
    bold: BOLD_CHAR,
    italic: ITALIC_CHAR,
    underline: UNDERLINE_CHAR,
    strikethrough: STRIKETHROUGH_CHAR
};

const FORMAT_CHAR_SET = new Set(Object.values(FORMAT_CHARS));

const isFormatChar = (char: string | null) => char !== null && FORMAT_CHAR_SET.has(char);

const FORMAT_KEYS = Object.keys(FORMAT_CHARS) as TextFormatCommand[];

const COMMAND_BY_CHAR = new Map<string, TextFormatCommand>(FORMAT_KEYS.map((command) => [FORMAT_CHARS[command], command]));

/** A run of visible text that has the same formats all along */
export type FormatToken = TextFormats & { text: string };

/** The colour marker that starts at the index: how long it is and the colour it sets (null for the theme colour). Null when there is none */
function readColorMarker(text: string, index: number): { length: number; color: string | null } | null {
    if (text[index] !== COLOR_CHAR) return null;
    if (text.startsWith('#}', index + 1)) return { length: 3, color: null };

    const candidate = text.slice(index + 1, index + 9);
    if (candidate.length === 8 && candidate.endsWith('}') && isHexColor(candidate.slice(0, 7))) {
        return { length: 9, color: candidate.slice(0, 7).toLowerCase() };
    }
    return null;
}

/** The marker that sets a colour (null for the theme colour) */
export const colorMarker = (color: string | null) => (color ? `${COLOR_CHAR}${color}}` : `${COLOR_CHAR}#}`);

/**
 * Reads a stored text: the only place that tells format characters, colour markers, escapes and visible text apart when reading.
 * Escaped characters, format characters and markers never end up in the text of a token, so the length of the tokens is the visible
 * length. A colour ends at the end of its line, as the text is drawn line by line. Without any visible character there is one empty
 * token. `end` is the state of the formats after the last character
 */
export function tokenizeFormattedText(text: string): { tokens: FormatToken[]; end: TextFormats } {
    const tokens: FormatToken[] = [];
    const state: TextFormats = { bold: false, italic: false, strikethrough: false, underline: false, color: null };
    let current = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === ESCAPE_CHAR) {
            // The next character is literal, and a trailing escape character is literal itself
            current += i + 1 < text.length ? text[++i] : char;
            continue;
        }

        const marker = readColorMarker(text, i);
        if (marker) {
            if (current) tokens.push({ text: current, ...state });
            current = '';
            state.color = marker.color;
            i += marker.length - 1;
            continue;
        }

        const command = COMMAND_BY_CHAR.get(char);
        if (command) {
            if (current) tokens.push({ text: current, ...state });
            current = '';
            state[command] = !state[command];
        } else {
            current += char;
            if (char === '\n' && state.color !== null) {
                tokens.push({ text: current, ...state });
                current = '';
                state.color = null;
            }
        }
    }

    if (current || tokens.length === 0) tokens.push({ text: current, ...state });
    return { tokens, end: { ...state } };
}

/**
 * The formats that the whole fragment of a text has. The fragment is given in visible characters, so format characters
 * do not count and an escaped character counts as one. A fragment without visible characters gets the format at the end of the text
 */
export function getFormatsInRange(markdown: string, visualStart: number, visualEnd: number): TextFormats {
    const { tokens, end } = tokenizeFormattedText(markdown);
    const shared: TextFormats = { bold: true, italic: true, strikethrough: true, underline: true, color: null };
    // Undefined until a token of the fragment is seen, then its colour, or null as soon as two of them differ
    let color: string | null | undefined;
    let offset = 0;
    let hasSelectedChars = false;

    for (const token of tokens) {
        // The token takes part when it has at least one visible character inside the fragment
        if (Math.max(offset, visualStart) < Math.min(offset + token.text.length, visualEnd)) {
            hasSelectedChars = true;
            for (const key of FORMAT_KEYS) shared[key] &&= token[key];
            color = color === undefined || color === token.color ? token.color : null;
        }
        offset += token.text.length;
    }

    return hasSelectedChars ? { ...shared, color: color ?? null } : end;
}

/**
 * Finds the fragment of a text in the string. The fragment is given in visible characters, which differ from the indexes of the
 * string: format characters and colour markers are not visible and an escaped character takes two
 */
function findFragment(text: string, visualStart: number, visualEnd: number): { start: number; end: number } {
    let start = -1;
    let end = -1;
    let visualIndex = 0;

    for (let i = 0; i <= text.length; i++) {
        const char = i < text.length ? text[i] : null;

        if (visualIndex === visualStart && start === -1 && !isFormatChar(char)) {
            start = i;
        }
        if (visualIndex === visualEnd && end === -1) {
            end = i;
        }

        if (i === text.length) break;

        if (char === ESCAPE_CHAR) {
            i++; // Skip the escaped character
            visualIndex++;
        } else {
            const marker = readColorMarker(text, i);
            if (marker) {
                i += marker.length - 1;
            } else if (!isFormatChar(char)) {
                visualIndex++;
            }
        }
    }

    return { start: start === -1 ? text.length : start, end: end === -1 ? text.length : end };
}

/**
 * Toggles a format on a fragment of a text and returns the new text. The fragment is given in visible characters.
 * If the fragment already has the format (isActive) it is removed from all of it, otherwise it is applied to all of it
 */
export function toggleTextFormat(text: string, visualStart: number, visualEnd: number, command: TextFormatCommand, isActive: boolean): string {
    const { start, end } = findFragment(text, visualStart, visualEnd);

    const formatChar = FORMAT_CHARS[command];
    const targetState = !isActive;

    // Whether the format is on where the fragment starts
    let isFormatOnAtStart = false;
    let before = '';
    for (let i = 0; i < start; i++) {
        const char = text[i];
        before += char;
        if (char === ESCAPE_CHAR) {
            if (i + 1 < start) {
                before += text[i + 1];
                i++;
            }
        } else if (char === formatChar) {
            isFormatOnAtStart = !isFormatOnAtStart;
        }
    }

    // The fragment without its own format characters, as it is wrapped again below if the format is turned on.
    // The state at its end tells whether the format continues after it
    let isFormatOnAtEnd = isFormatOnAtStart;
    let fragment = '';
    for (let i = start; i < end; i++) {
        const char = text[i];
        if (char === ESCAPE_CHAR) {
            fragment += char;
            if (i + 1 < end) {
                fragment += text[i + 1];
                i++;
            }
        } else if (char === formatChar) {
            isFormatOnAtEnd = !isFormatOnAtEnd;
        } else {
            fragment += char;
        }
    }

    // A format character is only needed at an edge of the fragment when the format changes there
    let result = before;
    if (targetState !== isFormatOnAtStart) result += formatChar;
    result += fragment;
    if (targetState !== isFormatOnAtEnd) result += formatChar;
    result += text.substring(end);

    return removeEmptyToggles(result, formatChar);
}

/** The colour that is on where the string has the given index: the last marker before it on its line */
function colorBefore(text: string, index: number): string | null {
    let color: string | null = null;
    for (let i = 0; i < index; i++) {
        if (text[i] === ESCAPE_CHAR) {
            // An escaped newline still ends the line, as the text is split at every newline
            if (text[i + 1] === '\n') color = null;
            i++;
            continue;
        }
        const marker = readColorMarker(text, i);
        if (marker) {
            color = marker.color;
            i += marker.length - 1;
        } else if (text[i] === '\n') {
            color = null;
        }
    }
    return color;
}

/**
 * Drops the colour markers that change nothing: the ones that set the colour that is already on, the ones that are overridden by the
 * next marker before a visible character, and the ones with no visible character after them on their line. A marker is written
 * right before the first visible character it affects, so the text is left in the shortest form
 */
export function normalizeColorMarkers(text: string): string {
    let result = '';
    let written: string | null = null; // The colour that the text written so far has on the current line
    let pending: string | null | undefined; // The colour set by the last marker, not written yet

    const flush = () => {
        if (pending !== undefined && pending !== written) {
            result += colorMarker(pending);
            written = pending;
        }
        pending = undefined;
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === ESCAPE_CHAR) {
            flush();
            result += char;
            if (i + 1 < text.length) {
                result += text[++i];
                if (text[i] === '\n') written = null;
            }
            continue;
        }

        const marker = readColorMarker(text, i);
        if (marker) {
            pending = marker.color;
            i += marker.length - 1;
        } else if (char === '\n') {
            pending = undefined;
            written = null;
            result += char;
        } else if (isFormatChar(char)) {
            result += char;
        } else {
            flush();
            result += char;
        }
    }

    return result;
}

/**
 * Sets the colour of a fragment of a text (null for the colour of the theme) and returns the new text. The fragment is given in visible
 * characters. The colours inside it are replaced, the colour around it is kept, and as a colour ends at the end of its line the new
 * colour is set again at the start of each line of the fragment
 */
export function setTextColor(text: string, visualStart: number, visualEnd: number, color: string | null): string {
    const { start, end } = findFragment(text, visualStart, visualEnd);
    if (start >= end) return text;

    const target = color ? color.toLowerCase() : null;

    // The fragment without its colour markers, with the new colour set at the start of each of its lines
    let fragment = '';
    for (let i = start; i < end; i++) {
        const char = text[i];
        if (char === ESCAPE_CHAR) {
            fragment += char;
            if (i + 1 < end) {
                fragment += text[i + 1];
                i++;
            }
            continue;
        }

        const marker = readColorMarker(text, i);
        if (marker) {
            i += marker.length - 1;
            continue;
        }

        fragment += char;
        if (char === '\n' && target !== null && i + 1 < end) fragment += colorMarker(target);
    }

    let result = text.slice(0, start) + colorMarker(target) + fragment;
    // What follows the fragment keeps the colour it had
    result += colorMarker(colorBefore(text, end));
    result += text.slice(end);

    return normalizeColorMarkers(result);
}
