/** Contains a list of inline and block components */
export interface Section<C> {
    id: string;
    title: string;
    content: Record<string, C>; // Admits components defined in C
}
