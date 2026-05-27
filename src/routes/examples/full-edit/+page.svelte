<script lang="ts">
	import '$lib/styles/scribe.css';
	import Scribe from '$lib/components/Scribe.svelte';
	import { fullExampleDocument } from '$lib/examples/fullExample.js';

</script>

<div class="flex w-full py-10 border-box justify-center">
	<Scribe document={fullExampleDocument} class="max-w-[70vw]" mode="edit" />
</div>
