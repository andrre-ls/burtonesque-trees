<script>
	import genomeStructure from '../burtonesque-trees/genomeStructure.js';
	import { genomeDictionary } from '../dictionary.js';
</script>

<div id="tree-parameters-container" class='def-scroll'>
	{#each Object.keys(genomeStructure) as gene}
		<div class="param-cont">
			<h4>{genomeDictionary[gene] || gene} <span>(10%)</span></h4>
			<input type="range" class="def-slider" />
		</div>
	{/each}
</div>

<style>
	#tree-parameters-container {
		position: relative;
		height: 200px;
		flex: auto;
		overflow-y: scroll;
		border: var(--stroke-size) solid var(--clr-main);
		border-radius: var(--stroke-size);
		padding: 0 1.5rem;
	}

	.param-cont {
		margin-top: 2.25rem;
		position: relative;
		width: calc(100% - 1rem);
	}

	.param-cont:first-child {
		margin-top: 2rem;
	}

	h4 {
		font-size: 1rem;
		font-weight: 700;
		margin: 0;
	}

	h4 > span {
		font-weight: 400;
		opacity: var(--op-secondary);
	}
</style>
