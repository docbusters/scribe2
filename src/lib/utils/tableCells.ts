import type { DataValue } from '../domain/data/DataValue.js';

/** The two directions of a table: a row is the first number of a cell key, a column the second */
export type TableAxis = 'row' | 'col';

/** A cell key, as `row:col` (see TableCellIndex) */
const CELL_KEY = /^(\d+):(\d+)$/;

/**
 * Removes a row or a column from the value of a table, a record of slots keyed by cell (`row:col`). The slots of the line are
 * dropped, and the ones after it move one place back so no gap is left. Entries whose key is not a cell are kept as they are.
 * Returns a new record (the slots are shared with the given one), or the value itself when it is not a record.
 */
export function removeTableLine(value: DataValue, axis: TableAxis, index: number): DataValue {
    if (value?.type !== 'record') return value;

    const cells: Record<string, DataValue> = {};
    for (const [key, slot] of Object.entries(value.value as Record<string, DataValue>)) {
        const match = CELL_KEY.exec(key);
        if (!match) {
            cells[key] = slot;
            continue;
        }

        let row = Number(match[1]);
        let col = Number(match[2]);
        const line = axis === 'row' ? row : col;
        if (line === index) continue;
        if (line > index) {
            if (axis === 'row') row--;
            else col--;
        }
        cells[`${row}:${col}`] = slot;
    }
    return { type: 'record', value: cells };
}
