<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
</script>

<div class="flex w-full py-10 border-box justify-center bg-(--scribe-doc-background)">
	<scribe-interpreter document={fullExampleDocument} bindings={fullExampleBindings} class="max-w-[70vw]" mode="edit"></scribe-interpreter>
</div>
