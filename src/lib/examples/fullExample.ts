import type { Document } from "$lib/domain/Document.js";

export const fullExampleDocument: Document = {
    title: 'Full Example Document',
    sections: [
        {
            title: 'First section',
            type: 'paragraph-section',
            content: [
                {
                    id: 'text-1',
                    mode: 'inline',
                    type: 'text',
                    value: {
                        type: 'binding',
                        id: 'name',
                    },
                },
                {
                    id: 'input-1',
                    mode: 'inline',
                    type: 'text-input',
                    value: {
                        type: 'binding',
                        id: 'name',
                    }
                },
                {
                    id: 'text-2',
                    mode: 'inline',
                    type: 'text',
                    value: {
                        type: 'string',
                        value: 'Place in the following input an url to an image:'
                    }
                },
                {
                    id: 'input-image',
                    mode: 'inline',
                    type: 'text-input',
                    value: {
                        type: 'binding',
                        id: 'image-url',
                    },
                    config: {
                        placeholder: 'https://example.com/image.jpg',
                        expandWithContent: true,
                    }
                },
                {
                    id: 'text-latex',
                    mode: 'inline',
                    type: 'text',
                    value: {
                        type: 'string',
                        value: 'Place in the following input a latex expression: '
                    }
                },
                {
                    id: 'input-latex',
                    mode: 'inline',
                    type: 'text-input',
                    value: {
                        type: 'binding',
                        id: 'latex-string',
                    }
                },
            ]
        },
        {
            title: 'Image section',
            type: 'block-section',
            content: {
                id: 'image-1',
                type: 'image',
                mode: 'block',
                value: {
                    type: 'binding',
                    id: 'image-url',
                },
                config: {
                    emptyText: 'No image URL provided. Please enter an URL in the input above.',
                    errorText: 'The provided URL is not a valid image. Please check the URL and try again.',
                }
            },
        },
        {
            title: 'Latex section',
            type: 'block-section',
            content: {
                id: 'latex-1',
                type: 'latex',
                mode: 'block',
                value: {
                    type: 'binding',
                    id: 'latex-string',
                }
            }
        },
        {
            title: 'Table section',
            type: 'block-section',
            content: {
                id: 'table-1',
                type: 'table',
                mode: 'block',
                value: {
                    type: 'record',
                    value: {
                        '0:0': {
                            type: 'component',
                            value: {
                                type: 'text',
                                id: 'text-table',
                                mode: 'inline',
                                value: {
                                    type: 'string',
                                    value: 'That cell is linked to the input below ->'
                                }
                            }
                        },
                        '0:1': {
                            type: 'component',
                            value: {
                                type: 'text',
                                id: 'text-table-2',
                                mode: 'inline',
                                value: {
                                    type: 'binding',
                                    id: 'table-value-binding',
                                }
                            }
                        },
                        '1:0': {
                            type: 'component',
                            value: {
                                type: 'text-input',
                                id: 'input-table-1',
                                mode: 'inline',
                                value: {
                                    type: 'binding',
                                    id: 'table-value-binding',
                                }
                            }
                        },
                        '1:1': {
                            type: 'component',
                            value: {
                                id: 'image-table',
                                type: 'image',
                                mode: 'block',
                                value: {
                                    type: 'string',
                                    value: 'https://sceps.es/wp-content/uploads/2017/08/Logo-UMU.jpg',
                                },
                                config: {
                                    height: '150px',
                                    position: 'contain',
                                    
                                    align: 'center',
                                }
                            }
                        },
                        '0:2': {
                            type: 'component',
                            value: {
                                type: 'text-input',
                                id: 'input-table-1',
                                mode: 'inline',
                                value: {
                                    type: 'binding',
                                    id: 'table-latex-binding',
                                }
                            }
                        },
                        '1:2': {
                            type: 'component',
                            value: {
                                type: 'latex',
                                id: 'table-latex',
                                mode: 'inline',
                                value: {
                                    type: 'binding',
                                    id: 'table-latex-binding',
                                }
                            }
                        }
                    }
                },
                config: {
                    cols: 3,
                    rows: 2,
                }
            }
        },
        {
            title: 'Grid section',
            type: 'grid-section',
            columns: 2,
            rows: 2,
            gapX: 40,
            gapY: 20,
            content: [
                {
                    row: 1,
                    column: 1,
                    section: {
                        title: 'Nested section 1',
                        type: 'paragraph-section',
                        content: [
                            {
                                id: 'text-4',
                                mode: 'inline',
                                type: 'text',
                                value: {
                                    type: 'string',
                                    value: 'This is a nested section inside the grid.'
                                }
                            }
                        ]
                    }
                },
                {
                    row: 2,
                    column: 2,
                    section: {
                        title: 'Nested section 2',
                        type: 'paragraph-section',
                        content: [
                            {
                                id: 'text-5',
                                mode: 'inline',
                                type: 'text',
                                value: {
                                    type: 'string',
                                    value: 'This is another nested section inside the grid.'
                                }
                            }
                        ]
                    }
                },
                {
                    row: 1,
                    column: 2,
                    section: {
                        title: 'I am a grid inside a grid (sectionception)',
                        type: 'grid-section',
                        columns: 2,
                        rows: 2,
                        gapX: 20,
                        gapY: 20,
                        content: [
                            {
                                row: 1,
                                column: 1,
                                colspan: 2,
                                section: {
                                    title: 'Nested nested section 1',
                                    type: 'paragraph-section',
                                    content: [
                                        {
                                            id: 'text-6',
                                            mode: 'inline',
                                            type: 'text',
                                            value: {
                                                type: 'string',
                                                value:
                                                    'This is a nested section inside the nested grid. I occupy 2 columns!'
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                row: 2,
                                column: 2,
                                section: {
                                    title: 'Nested nested section 2',
                                    type: 'paragraph-section',
                                    content: [
                                        {
                                            id: 'text-7',
                                            mode: 'inline',
                                            type: 'text',
                                            value: {
                                                type: 'string',
                                                value: 'This is another nested section inside the nested grid.'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    bindings: {
        name: { type: 'string', initialValue: 'I am a binded name!!!' },
        'image-url': { type: 'string', initialValue: '' },
        'latex-string': { type: 'string', initialValue: '\\frac{1}{n} \\sum_{i=1}^n x_i' },
        'table-value-binding': { type: 'string', initialValue: '67' },
        'table-latex-binding': { type: 'string', initialValue: 'I hate LaTeX' },
    }
};
