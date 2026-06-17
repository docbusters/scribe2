<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
	import type { Document } from '$lib/domain/Document.js';
	import type { CollectionValue, PrimitiveValue } from '$lib/domain/data/DataValue.js';
	import type { BindingDefinitionUpdate, CustomBinding, CustomBindingValueUpdate, ScribeProps } from '$lib/types/ScribeProps.js';


	// BASIC CUSTOM BINDING EXAMPLE

	const bindingData = $state<Record<string, PrimitiveValue | CollectionValue>>({
		'example-binding': { type: 'string', value: 'This is an example binding value.' },
		'example-image-binding': { type: 'string', value: 'https://sceps.es/wp-content/uploads/2017/08/Logo-UMU.jpg' }
	});

	const customBinding: CustomBinding = {
		type: 'custom-binding',
		name: 'Custom Binding',
		getAvailableIds: () => {
			return Object.entries(bindingData).map(([id, value]) => ({ id, label: id, type: value.type }));
		},
		getData: (id) => {
			if (!bindingData[id]) {
				throw new Error(`No binding data found for ID: ${id}`);
			}
			return bindingData[id];
		}
	};


	// LIVE CLOCK BINDING EXAMPLE

	const liveClockBinding: CustomBinding = {
		type: 'live-clock',
		name: 'Live clock',
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
				type: 'paragraph-section',
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
				type: 'paragraph-section',
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
	}

	function handleBindingChange(event: CustomEvent<CustomBindingValueUpdate | BindingDefinitionUpdate>) {
		const { type, id } = event.detail;

		if (type === 'value_update') {
			const { value } = event.detail;
			bindingData[id] = value; // Update the binding data, which will trigger the updaters
		}
	}
</script>

<div class="flex flex-col items-center w-full py-10 border-box gap-8 bg-(--scribe-doc-background)">
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
	<Scribe document={documentWithBindings} bindings={fullExampleBindings} {customBindings} onbindingchange={handleBindingChange} class="max-w-[70vw]" mode="edit" />
</div>
