import type { InlineComponent } from "$lib/domain/components/Component.ts";
import type { TextComponent } from "$lib/domain/components/TextComponent.ts";
import type { NumberValue } from "$lib/domain/data/DataValue.ts";
import type { Document } from "$lib/domain/Document.ts";

type Components = TextComponent | InputComponent;

type InputComponent = InlineComponent<'input', NumberValue>;

export const basicExampleDocument: Document = {
    title: "Basic Example Document",
    sections: [
        {
            title: "Introduction",
            type: "paragraph-section",
            content: [
                {
                    id: "text-1",
                    mode: "inline",
                    type: "text",
                    value: {
                        type: "string",
                        value: "This is a basic example document to demonstrate the structure of a Document with Sections and Components."
                    }
                },
                {
                    type: 'input',
                    id: 'input-1',
                    mode: 'inline',
                    value: {
                        type: 'number',
                        value: 42
                    }
                }
            ]
        }
    ]
}
