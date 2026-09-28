<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
	import type { SupportedLanguage } from '$lib/i18n/types.js';

	// Reactive language state for the preview page
	let currentLang = $state<SupportedLanguage>('es');
</script>

<div class="flex w-full py-10 border-box justify-center">
	<Scribe
		document={fullExampleDocument}
		bindings={fullExampleBindings}
		class="max-w-[70vw]"
		mode="edit"
		lang={currentLang}
	/>
</div>

<!-- Floating Language Switcher (Preview Page Only) -->
<div class="fixed bottom-6 right-6 z-50 flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all">
	<div class="flex items-center pl-2 pr-1 text-blue-600" aria-hidden="true">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</svg>
	</div>

	<div class="flex items-center gap-1">
		<button
			type="button"
			class="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border-0 transition-all duration-200 {currentLang === 'es' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
			onclick={() => (currentLang = 'es')}
			title="Cambiar a Español"
		>
			ES
		</button>
		<button
			type="button"
			class="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border-0 transition-all duration-200 {currentLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
			onclick={() => (currentLang = 'en')}
			title="Switch to English"
		>
			EN
		</button>
	</div>
</div>
