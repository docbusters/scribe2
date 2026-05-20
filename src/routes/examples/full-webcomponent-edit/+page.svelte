<script lang="ts">
	import '../../../../dist/scribe.css';
	import '../../../../dist/scribe.js';
	import { fullExampleDocument } from '$lib/examples/fullExample.js';
</script>

<div class="flex justify-center w-full py-10 border-box">
	<scribe-interpreter document={fullExampleDocument} mode="edit"></scribe-interpreter>
</div>
