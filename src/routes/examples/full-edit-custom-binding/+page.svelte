<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
	import LiveClockRow from '$lib/examples/LiveClockRow.svelte';
	// A host app imports this from '@antonii22/scribe2/svelte', which is published as source so its own Svelte compiles it
	import { createSvelteItemRenderer } from '$lib/svelte/mount.svelte.js';
	import { getAllContexts, setContext } from 'svelte';
	import type { Document } from '$lib/domain/Document.js';
	import type { CollectionValue, PrimitiveValue } from '$lib/domain/data/DataValue.js';
	import type { BindingChangeEventDetail, BindingItemProps, BindingPickerProps, CustomBinding, ScribeProps } from '$lib/types/ScribeProps.js';

	// The rows of a custom binding can be drawn by the host. With plain DOM here, as any framework would do it: a node comes in,
	// and an update and a destroy go out. Scribe keeps the button of the row, so the selection and the keyboard still work
	function renderCustomRow(node: HTMLElement, initial: BindingItemProps) {
		const title = document.createElement('strong');
		const detail = document.createElement('span');
		detail.style.cssText = 'display: block; font-size: 0.75rem; opacity: 0.7;';
		node.append(title, detail);

		const paint = (props: BindingItemProps) => {
			title.textContent = `${props.isSelected ? '★ ' : ''}${props.label}`;
			detail.textContent = props.isLoading ? 'Loading from the server...' : `${props.type}: ${props.preview}`;
		};
		paint(initial);

		return { update: paint, destroy: () => node.replaceChildren() };
	}

	// BASIC CUSTOM BINDING EXAMPLE

	const bindingData = $state<Record<string, PrimitiveValue | CollectionValue>>({
		'example-binding': { type: 'string', value: 'This is an example binding value.' },
		'example-image-binding': { type: 'string', value: 'https://sceps.es/wp-content/uploads/2017/08/Logo-UMU.jpg' }
	});

	const customBinding: CustomBinding = {
		type: 'custom-binding',
		name: 'Custom Binding',
		description: 'Sample external data source with asynchronous loading',
		renderItem: renderCustomRow,
		getAvailableIds: () => {
			return Object.entries(bindingData).map(([id, value]) => ({ id, label: id, type: value.type }));
		},
		getData: async (id) => {
			if (!bindingData[id]) {
				throw new Error(`No binding data found for ID: ${id}`);
			}
			await new Promise(resolve => setTimeout(resolve, 2000));
			return bindingData[id];
		}
	};


	// SHEET BINDING EXAMPLE (a picker drawn by the host)

	// One id per cell, as a spreadsheet would give them. The picker below is plain DOM too: the contract needs no framework
	const sheetColumns = ['A', 'B', 'C', 'D'];
	const sheetRows = [1, 2, 3, 4, 5, 6];
	const sheetValues: Record<string, PrimitiveValue> = {};
	for (const row of sheetRows) {
		for (const column of sheetColumns) {
			sheetValues[`${column}${row}`] =
				row === 1 ? { type: 'string', value: `Header ${column}` }
				: column === 'D' ? { type: 'boolean', value: row % 2 === 0 }
				: column === 'A' ? { type: 'string', value: `Item ${row - 1}` }
				: { type: 'number', value: row * 10 + sheetColumns.indexOf(column) };
		}
	}

	// Draws the sheet read only. A click on a cell tells Scribe the id, which ignores it when the component cannot take that type
	function renderSheetPicker(node: HTMLElement, initial: BindingPickerProps) {
		let props = initial;
		const table = document.createElement('table');
		table.style.cssText = 'border-collapse: collapse; width: 100%; font-size: 0.875rem;';
		const buttons: Record<string, HTMLButtonElement> = {};

		const header = table.createTHead().insertRow();
		header.insertCell().textContent = '';
		for (const column of sheetColumns) {
			const cell = header.insertCell();
			cell.textContent = column;
			cell.style.cssText = 'padding: 0.5rem; text-align: center; opacity: 0.6;';
		}

		const body = table.createTBody();
		for (const row of sheetRows) {
			const tr = body.insertRow();
			const label = tr.insertCell();
			label.textContent = String(row);
			label.style.cssText = 'padding: 0.5rem; text-align: center; opacity: 0.6;';
			for (const column of sheetColumns) {
				const id = `${column}${row}`;
				const button = document.createElement('button');
				button.type = 'button';
				button.textContent = String(sheetValues[id].value);
				button.style.cssText = 'width: 100%; min-height: 2.25rem; padding: 0 0.5rem; border: 1px solid #8884; background: none; color: inherit; cursor: pointer; font: inherit;';
				button.addEventListener('click', () => props.select(id));
				tr.insertCell().append(button);
				buttons[id] = button;
			}
		}

		const paint = (next: BindingPickerProps) => {
			props = next;
			for (const [id, button] of Object.entries(buttons)) {
				button.style.outline = id === next.selectedId ? '2px solid #2563eb' : 'none';
				button.style.opacity = next.isTypeAccepted(sheetValues[id].type) ? '1' : '0.4';
			}
		};
		paint(initial);
		node.append(table);

		return { update: paint, destroy: () => node.replaceChildren() };
	}

	const sheetBinding: CustomBinding = {
		type: 'sheet',
		name: 'Sheet',
		description: 'One value per cell, chosen on the sheet itself',
		renderItem: renderCustomRow,
		renderPicker: renderSheetPicker,
		getAvailableIds: () => Object.entries(sheetValues).map(([id, value]) => ({ id, label: id, type: value.type })),
		getData: async (id) => {
			if (!sheetValues[id]) throw new Error(`No cell found for ID: ${id}`);
			return sheetValues[id];
		}
	};

	// LIVE CLOCK BINDING EXAMPLE

	// A row mounted by Scribe is a new root, so it does not inherit the context of this page: it has to be passed to the helper.
	// `getAllContexts` only works while the component initialises, which is where this binding is built
	setContext('live-clock-hint', 'Updates every second');
	const rowContext = getAllContexts();

	const liveClockBinding: CustomBinding = {
		type: 'live-clock',
		name: 'Live clock',
		description: 'Dynamic real-time clock updating every second',
		// The row is a Svelte component of the examples. The one of `custom-binding` above is plain DOM: the contract needs no framework
		renderItem: createSvelteItemRenderer(LiveClockRow, rowContext),
		// Scribe draws no frame around the rows: LiveClockRow draws its own card, its check and its disabled state
		bareItems: true,
		getAvailableIds: () => [{ id: 'not-used', label: 'Default live clock', type: 'string' }],
		getData: () => {
			return {
				value: { type: 'string', value: 'Calculating time...' },
				subscribe: (update) => {
					const timer = setInterval(() => {
						const timeString = new Date().toLocaleTimeString();
						update({ type: 'string', value: `Current time: ${timeString}` });
					}, 1000);

					return () => clearInterval(timer);
				}
			};
		}
	};

	const documentWithBindings: Document = {
		...fullExampleDocument,
		sections: {
			"example-binding-1": {
				id: "example-binding-1",
				title: "Example bindings",
				content: {
					"image-bind": {
						id: "image-bind",
						type: 'image',
						mode: 'block',
						value: {
							type: 'binding',
							bindingType: 'custom-binding',
							value: 'example-image-binding',
						}
					},
					"latex-bind": {
						id: "latex-bind",
						type: 'latex',
						mode: 'block',
						value: {
							type: 'binding',
							bindingType: 'custom-binding',
							value: 'example-binding',
						}
					}
				}
			},
			"example-binding-2": {
				id: "example-binding-2",
				title: "Example live clock",
				content: {
					"latex-bind": {
						id: "latex-bind",
						type: 'latex',
						mode: 'block',
						value: {
							type: 'binding',
							bindingType: 'live-clock',
							value: 'not-used', // In this case, the value can be ignored since the live clock binding doesn't use it
						}
					}
				}
			},
			...fullExampleDocument.sections,
		},
	};

	const customBindings: ScribeProps['customBindings'] = {
		'custom-binding': customBinding,
		'live-clock': liveClockBinding,
		'sheet': sheetBinding,
	}

	function handleBindingChange(event: CustomEvent<BindingChangeEventDetail>) {
		const { type, id } = event.detail;

		if (type === 'value_update') {
			const { value } = event.detail;
			bindingData[id] = value; // Update the binding data, which will trigger the updaters
		}
	}
</script>

<div class="flex flex-col items-center w-full py-10 border-box gap-8">
	<div class="fixed z-1 top-5 right-5 flex flex-col gap-4 p-4 border rounded bg-gray-50">
		<label class="flex flex-col text-sm font-semibold">
			Example
			<input 
				bind:value={bindingData['example-binding'].value} 
				class="border p-2 mt-1 rounded font-normal"
			/>
		</label>
		<label class="flex flex-col text-sm font-semibold">
			Image url
			<input 
				bind:value={bindingData['example-image-binding'].value} 
				class="border p-2 mt-1 rounded font-normal"
			/>
		</label>
	</div>

	<!-- Editor Scribe usando nuestro documento inyectado -->
	<Scribe document={documentWithBindings} bindings={fullExampleBindings} {customBindings} onbindingchange={handleBindingChange} class="max-w-[70vw]" mode="edit" showPrintButton />
</div>
