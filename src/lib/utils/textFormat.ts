import { BOLD_CHAR, ESCAPE_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../constants/DocumentConstants.js';
import { removeEmptyToggles } from './textFormatEscape.js';

export type TextFormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough';

export interface TextFormats {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
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

/**
 * Reads a stored text: the only place that tells format characters, escapes and visible text apart when reading.
 * Escaped characters and format characters never end up in the text of a token, so the length of the tokens is the visible length.
 * Without any visible character there is one empty token. `end` is the state of the formats after the last character
 */
export function tokenizeFormattedText(text: string): { tokens: FormatToken[]; end: TextFormats } {
    const tokens: FormatToken[] = [];
    const state: TextFormats = { bold: false, italic: false, strikethrough: false, underline: false };
    let current = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === ESCAPE_CHAR) {
            // The next character is literal, and a trailing escape character is literal itself
            current += i + 1 < text.length ? text[++i] : char;
            continue;
        }

        const command = COMMAND_BY_CHAR.get(char);
        if (command) {
            if (current) tokens.push({ text: current, ...state });
            current = '';
            state[command] = !state[command];
        } else {
            current += char;
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
    const shared: TextFormats = { bold: true, italic: true, strikethrough: true, underline: true };
    let offset = 0;
    let hasSelectedChars = false;

    for (const token of tokens) {
        // The token takes part when it has at least one visible character inside the fragment
        if (Math.max(offset, visualStart) < Math.min(offset + token.text.length, visualEnd)) {
            hasSelectedChars = true;
            for (const key of FORMAT_KEYS) shared[key] &&= token[key];
        }
        offset += token.text.length;
    }

    return hasSelectedChars ? shared : end;
}

/**
 * Toggles a format on a fragment of a text and returns the new text. The fragment is given in visible characters.
 * If the fragment already has the format (isActive) it is removed from all of it, otherwise it is applied to all of it
 */
export function toggleTextFormat(text: string, visualStart: number, visualEnd: number, command: TextFormatCommand, isActive: boolean): string {
    // The visible characters of a fragment differ from the indexes of the string: format characters are not visible and
    // an escaped character takes two. The indexes of the fragment in the string are found first
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
        } else if (!isFormatChar(char)) {
            visualIndex++;
        }
    }

    if (start === -1) start = text.length;
    if (end === -1) end = text.length;

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
