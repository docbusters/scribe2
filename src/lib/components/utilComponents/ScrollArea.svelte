<script lang="ts">
	import { ScrollArea, type WithoutChild } from 'bits-ui';

	type Props = WithoutChild<ScrollArea.RootProps> & {
		orientation?: 'vertical' | 'horizontal' | 'both';
		type?: 'auto' | 'always' | 'scroll' | 'hover';
		viewportClasses?: string;
		scrollbarClasses?: string;
		thumbClasses?: string;
	};

	let {
		ref = $bindable(null),
		orientation = 'vertical',
		type = 'auto',
		viewportClasses = '',
		scrollbarClasses = '',
		thumbClasses = '',
		children,
		...restProps
	}: Props = $props();
</script>

{#snippet Scrollbar({ orientation }: { orientation: 'vertical' | 'horizontal' })}
	<ScrollArea.Scrollbar {orientation} class="scribe-scrollarea-scrollbar {scrollbarClasses}">
		<ScrollArea.Thumb class="scribe-scrollarea-thumb {thumbClasses}" />
	</ScrollArea.Scrollbar>
{/snippet}

<ScrollArea.Root bind:ref {type} {...restProps}>
	<ScrollArea.Viewport class="scribe-scrollarea-viewport {viewportClasses}">
		{@render children?.()}
	</ScrollArea.Viewport>
	{#if orientation === 'vertical' || orientation === 'both'}
		{@render Scrollbar({ orientation: 'vertical' })}
	{/if}
	{#if orientation === 'horizontal' || orientation === 'both'}
		{@render Scrollbar({ orientation: 'horizontal' })}
	{/if}
	<ScrollArea.Corner />
</ScrollArea.Root>

<style>
	:global(.scribe-scrollarea-viewport) {
		width: 100%;
		height: 100%;
		min-height: 0;
	}

	:global(.scribe-scrollarea-scrollbar) {
		display: flex;
		user-select: none;
		touch-action: none;
		padding: 1px;
		transition: opacity 150ms ease-out;
		z-index: 10;
	}

	:global(.scribe-scrollarea-scrollbar[data-orientation='vertical']) {
		width: 8px;
		height: 100%;
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
	}

	:global(.scribe-scrollarea-scrollbar[data-orientation='horizontal']) {
		height: 8px;
		width: 100%;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		flex-direction: column;
	}

	:global(.scribe-scrollarea-thumb) {
		position: relative;
		flex: 1;
		width: 100% !important;
		min-width: 6px;
		border-radius: 9999px;
		background-color: var(--scribe-border-color);
		cursor: pointer;
		transition: background-color 150ms ease-out;
	}

	:global(.scribe-scrollarea-thumb:hover) {
		background-color: var(--scribe-muted-foreground);
	}
</style>
