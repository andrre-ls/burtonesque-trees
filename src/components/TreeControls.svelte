<script>
	import TreeParameters from './TreeParameters.svelte';
	export let tree;

	console.log(tree);
</script>

<div id="controls-container">
	<section>
		<h3>Tree Parameters</h3>
		<TreeParameters />
	</section>
	<section>
		<h3>Parameter Controls</h3>
		<button class="def-bttn">New Seed</button>
		<button class="def-bttn">Reset Parameters</button>
		<button class="def-bttn">Randomize Parameters</button>
	</section>
	<section>
		<h3>Export</h3>
		<button class="def-bttn">Download SVG</button>
		<button class="def-bttn">Download PNG</button>
	</section>
</div>

<style>
	#controls-container {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	section {
		margin-top: 2.75rem;
	}

	section:first-child {
		margin-top: 0;
		flex: auto;
		display: flex;
		flex-direction: column;
	}

	h3 {
		font-size: 1.2rem;
		font-style: italic;
		font-weight: 700;
		margin: 0;
		margin-bottom: 0.5rem;
	}
</style>
