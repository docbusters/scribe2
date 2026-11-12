// Makes the next character of a text literal, so it is not read as a format character
export const ESCAPE_CHAR = "\\";

// Special characters used to format text
export const BOLD_CHAR = "*";
export const ITALIC_CHAR = "_";
export const UNDERLINE_CHAR = "~";
export const STRIKETHROUGH_CHAR = "-";

// Starts a colour marker: `{#rrggbb}` sets the colour of the text that follows, and `{#}` goes back to the colour of the theme.
// It only means something when it is followed by exactly one of those two, so any other `{` is literal text. A colour ends at the
// end of its line
export const COLOR_CHAR = "{";
