<script>
	import genomeStructure from '../burtonesque-trees/genomeStructure.js';
	export let tree;
	const treeGenome = tree.genome;

	const handleChangeGenome = () =>  tree.generate();
    const handleRandomizeParameters = () => {
        tree.randomizeGenome();
		tree.generate();
    }
	const handleNewSeed = () => {
		tree.newSeed();
		tree.generate();
	};
</script>

<div>
	<div id="genome-controls">
		{#each Object.keys(genomeStructure) as genome}
			<div class="genome-control">
				<h4>{genome}</h4>
				<input type="range" bind:value={treeGenome[genome]} on:input={handleChangeGenome} min={genomeStructure[genome].min} max={genomeStructure[genome].max} step={genomeStructure[genome].step} />
			</div>
		{/each}
	</div>
	<div id="tree-controls">
		<button on:click={handleRandomizeParameters}>Randomize Parameters</button>
		<button on:click={handleNewSeed}>New Seed</button>
	</div>
</div>
