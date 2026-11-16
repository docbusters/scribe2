<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import { fullExampleBindings, fullExampleDocument } from '$lib/examples/fullExample.js';
</script>

<!-- The ribbon is placed by the page (sticky here), and comes before the interpreter on purpose: it must work when it mounts first -->
<div class="flex w-full flex-col items-center gap-6 py-10 border-box">
	<div class="top-2 z-10 w-full max-w-[70vw]">
		<scribe-top-toolbar></scribe-top-toolbar>
	</div>
	<scribe-interpreter document={fullExampleDocument} bindings={fullExampleBindings} class="max-w-[70vw]" mode="edit" showTopToolbar={false} showPrintButton={true}></scribe-interpreter>
</div>
