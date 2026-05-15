/** 
 * Parses a string for use in a contenteditable element
 * Example: "Hello\nWorld\n" => ["Hello", "", "World", ""]
 * Another example: "Hello\n\n\nWorld" => ["Hello", "", "", "", "World"]
 * The empty strings represent the newlines, allowing us to replace them with <br> tags!
 */
export function parseStringForContentEditable(input: string): string[] {
    // Normalize line endings to avoid issues with Windows (\r\n) formats
    const normalizedInput = input.replace(/\r\n/g, '\n');
    
    // Match one or more non-newline characters, OR a single newline character
    const matches = normalizedInput.match(/([^\n]+|\n)/g) || [];
    
    // Map the literal newline characters to empty strings
    return matches.map(match => (match === '\n' ? '' : match));
}
