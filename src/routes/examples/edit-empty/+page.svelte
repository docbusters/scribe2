<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import type { Document } from '$lib/index.js';

	const document: Document = {
		title: 'Empty Editable Document',
		sections: {
			"section-1": {
				title: "Paragraph Section",
				id: "section-1",
				type: "paragraph-section",
				content: {}
			}
		},
		bindings: {}
	}
</script>

<div class="flex justify-center w-full py-10 border-box">
	<Scribe {document} mode="edit" />
</div>
