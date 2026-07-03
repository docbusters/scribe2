<script lang="ts">
    /* eslint-disable svelte/no-at-html-tags */
	import { resolve } from "$app/paths";

	const routes = [
		{ 
            path: '/examples/full', 
            label: 'Full Example', 
            description: 'View the complete component set in read-only mode.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>' 
        },
		{ 
            path: '/examples/full-edit', 
            label: 'Editable Example', 
            description: 'Interactive editor mode with all components available to modify.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>' 
        },
		{ 
            path: '/examples/full-webcomponent', 
            label: 'Web Component', 
            description: 'Demonstration of the library bundled as a standalone custom element.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>' 
        },
		{ 
            path: '/examples/full-webcomponent-edit', 
            label: 'Web Component Edit', 
            description: 'Editable Web Component mode demonstration with configuration.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>' 
        },
		{ 
            path: '/examples/edit-empty', 
            label: 'Empty Editor', 
            description: 'Start with a clean slate in the editor to build from scratch.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>' 
        },
		{ 
            path: '/examples/full-edit-custom-binding', 
            label: 'Custom Binding', 
            description: 'Editor initialized with custom data binding examples and stores.', 
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>' 
        }
	];
</script>

<div class="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
	<div class="max-w-5xl w-full">
		
		<!-- Header Section -->
		<div class="text-center mb-16 space-y-6">
			<h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
				Welcome to <span class="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Scribe</span>
			</h1>
			<p class="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
				A powerful web component library for building rich, interactive documents and editors. Select an example below to explore its capabilities.
			</p>
		</div>

		<!-- Demos Grid -->
		<div class="mb-8 flex items-center gap-3">
			<div class="h-8 w-1.5 bg-blue-500 rounded-full"></div>
			<h2 class="text-2xl font-bold text-slate-800">
				Examples
			</h2>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each routes as route(route.path)}
				<a 
					href={resolve(route.path, {})} 
					class="group flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
				>
					<div class="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-5 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300 shadow-sm border border-slate-100">
						{@html route.icon}
					</div>
					
					<h3 class="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{route.label}</h3>
					
					<p class="text-sm text-slate-500 leading-relaxed grow">{route.description}</p>
					
					<div class="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
						View Example 
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</div>
				</a>
			{/each}
		</div>
        
	</div>
</div>

<style>
    a {
        text-decoration: none;
    }
</style>