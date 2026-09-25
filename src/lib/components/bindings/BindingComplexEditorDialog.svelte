<script lang="ts">
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import ComponentEditorValue from '../component/ComponentEditorValue.svelte';
	import type { DataValue } from '$lib/domain/data/DataValue.js';

	interface BindingComplexEditorDialogProps {
		open: boolean;
		bindingId: string;
		bindingType: string;
		initialValue: unknown;
		onsave: (updatedValue: unknown) => void;
	}

	let {
		open = $bindable(false),
		bindingId,
		bindingType,
		initialValue,
		onsave
	}: BindingComplexEditorDialogProps = $props();

	let draftValue = $state<unknown>(null);

	$effect(() => {
		if (open) {
			try {
				draftValue = structuredClone($state.snapshot(initialValue));
			} catch {
				draftValue = JSON.parse(JSON.stringify(initialValue ?? (bindingType === 'array' ? [] : {})));
			}
		}
	});

	const parsedValueType = $derived<{ type: DataValue['type']; bindingType?: string }>({
		type: bindingType as DataValue['type']
	});

	const initialDataValue = $derived.by<DataValue>(() => {
		const val = $state.snapshot(initialValue);
		return {
			type: bindingType as DataValue['type'],
			value: val
		} as DataValue;
	});

	function handleSave() {
		onsave($state.snapshot(draftValue));
		open = false;
	}

	function handleCancel() {
		open = false;
	}
</script>

<Dialog bind:open title={`Configure Binding: ${bindingId}`}>
	<div class="value-selector-container">
		<div class="config-section">
			<div class="section-header">
				<div class="title-with-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="section-icon"
					>
						<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
						<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
						<line x1="12" y1="22.08" x2="12" y2="12" />
					</svg>
					<h5>Value Configuration</h5>
				</div>
				<p class="section-desc">Configure the elements and parameters for binding "{bindingId}"</p>
			</div>

			<div class="value-input-card">
				{#if draftValue !== null}
					<ComponentEditorValue
						{parsedValueType}
						bind:value={draftValue}
						{initialDataValue}
					/>
				{/if}
			</div>
		</div>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel}>Cancel</Button>
		<Button onclick={handleSave}>Apply Changes</Button>
	{/snippet}
</Dialog>

<style>
	.value-selector-container {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 0.5rem 0.25rem 0.5rem 0;
		max-height: 65vh;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--scribe-border-color) 60%, transparent) transparent;
	}

	.value-selector-container::-webkit-scrollbar {
		width: 6px;
	}

	.value-selector-container::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--scribe-border-color) 50%, transparent);
		border-radius: 9999px;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.title-with-icon {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-icon {
		color: var(--scribe-primary, #3b82f6);
	}

	h5 {
		margin: 0;
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-md);
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--scribe-doc-foreground);
	}

	.section-desc {
		margin: 0;
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-muted-foreground);
		line-height: 1.4;
	}

	.value-input-card {
		padding: 0.25rem 0;
		border: none;
		background-color: transparent;
		box-shadow: none;
	}
</style>
