<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';

</script>

<div class="flex justify-center w-full py-10 border-box">
	<Scribe document={fullExampleDocument} bindings={fullExampleBindings} class="max-w-[70vw]" />
</div>
