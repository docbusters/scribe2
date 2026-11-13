import type { BaseComponent, ComponentConfig } from '../domain/components/Component.js';
import type { DataValue, StringValue } from '../domain/data/DataValue.js';

type AnyComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

/**
 * Joins every run of adjacent text components of a list into its first text, which keeps its id. The separator is put between two
 * non-empty texts that neither end nor start with it, so deleting a component between "Hello " and "world" does not double the space.
 * `targetId` is the component the caller is following (the one it has just inserted): `targetId` of the result is the id of the text
 * it ended up in, or undefined when it was not merged into any text (or is not a text).
 * The list is never mutated: when nothing is merged the result has the same entries.
 */
export function mergeAdjacentTexts<T extends AnyComponent>(
    entries: [string, T][],
    targetId?: string,
    separator: '' | ' ' | '\n' = ''
): { entries: [string, T][]; targetId: string | undefined } {
    const merged: [string, T][] = [];
    let resultingTargetId: string | undefined;
    let i = 0;

    while (i < entries.length) {
        const [currentId, current] = entries[i];

        if (current.type !== 'text') {
            merged.push([currentId, current]);
            i++;
            continue;
        }

        let text = (current.value as StringValue).value;
        let didMergeTarget = currentId === targetId;
        let j = i + 1;

        while (j < entries.length && entries[j][1].type === 'text') {
            const [nextId, next] = entries[j];
            const nextText = (next.value as StringValue).value;

            if (separator && text && nextText && !text.endsWith(separator) && !nextText.startsWith(separator)) {
                text += separator;
            }
            text += nextText;

            if (nextId === targetId) didMergeTarget = true;
            j++;
        }

        merged.push([currentId, j > i + 1 ? { ...current, value: { type: 'string', value: text } } as T : current]);
        if (didMergeTarget) resultingTargetId = currentId;
        i = j;
    }

    return { entries: merged, targetId: resultingTargetId };
}
