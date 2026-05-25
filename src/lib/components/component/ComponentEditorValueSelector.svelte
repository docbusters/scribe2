<script lang="ts">
	import { type ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { Dialog } from 'bits-ui';
	import ComponentEditorButton from './ComponentEditorButton.svelte';
	import { getContext } from 'svelte';

	let props: ComponentEditProps = $props();

	const supportedValues = $derived(globalRegistry.getComponentValueTypes(props.componentType));

	const getPortalTarget = getContext<() => HTMLElement | null>('scribe-portal-target');
	const portalTarget = $derived(getPortalTarget?.() || undefined);
</script>



<Dialog.Root>
  <Dialog.Trigger>
    {#snippet child({props: dialogTriggerProps})}
      <ComponentEditorButton
        icon={props.icon}
        name={props.name}
        disabled={props.disabled}
        {...dialogTriggerProps}
      />
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Portal to={portalTarget}>
    <Dialog.Overlay class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border p-5 sm:max-w-[490px] md:w-full"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-lg font-semibold tracking-tight">Set new value</Dialog.Title>
      <Dialog.Description class="text-foreground-alt text-sm" />
       <div class="min-h-100 min-w-100"></div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
</style>
