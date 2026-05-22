<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import { fullExampleDocument } from '$lib/examples/fullExample.js';
</script>

<div class="flex justify-center w-full py-10 border-box justify-center">
	<scribe-interpreter document={fullExampleDocument} class="max-w-[70vw]" mode="edit"></scribe-interpreter>
</div>
