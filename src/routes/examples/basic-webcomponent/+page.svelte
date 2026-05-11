<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import type { Document } from '../../../../dist/index.d.ts';

	const basicExampleDocument: Document = {
		title: 'I am using the compiled webcomponent version of Scribe!!!',
		sections: [
			{
				title: 'Introduction',
				type: 'paragraph-section',
				content: [
					{
						id: 'text-1',
						mode: 'inline',
						type: 'text',
						value: {
							type: 'string',
							value:
								'This is a basic example document to demonstrate the structure of a Document with Sections and Components.'
						}
					}
				]
			},
			{
				title: 'First section',
				type: 'paragraph-section',
				content: [
					{
						id: 'text-2',
						mode: 'inline',
						type: 'text',
						value: {
							type: 'binding',
							id: 'name'
						}
					},
					{
						id: 'input-1',
						mode: 'inline',
						type: 'text-input',
						value: {
							type: 'binding',
							id: 'name'
						}
					}
				]
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
			name: { type: 'string', initialValue: 'I am a binded name!!!' }
		}
	};
</script>

<scribe-interpreter document={basicExampleDocument}></scribe-interpreter>
