/** Returns a copy with the enabled (compatible) items first, keeping the original order inside each group */
export function compatibleFirst<T extends { disabled?: boolean }>(items: T[]): T[] {
    return [...items].sort((a, b) => Number(!!a.disabled) - Number(!!b.disabled));
}
