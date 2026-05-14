import { v4 as uuidv4 } from "uuid";

export function generateRandomId(postfix: string = ""): string {
    return `${uuidv4()}-${postfix}`;
}
