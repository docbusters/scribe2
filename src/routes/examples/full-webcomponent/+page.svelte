<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
</script>

<div class="flex w-full py-10 border-box justify-center">
	<scribe-interpreter document={fullExampleDocument} bindings={fullExampleBindings} class="max-w-[70vw]"></scribe-interpreter>
</div>
