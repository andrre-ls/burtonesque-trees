<script>
	import { onMount } from 'svelte';
	import { genomeStructure } from '../burtonesque-trees/genomeStructure.js';
	import { genomeDictionary } from '../ui-utils/dictionary.js';

	export let tree;
	export let debugStyle = false;

	let paramContainer;
	onMount(() => {
		// remove scroll pointer when the users scrolls on the container
		paramContainer.addEventListener(
			'scroll',
			() => {
				const scrollPointer = document.getElementById('scroll-pointer');
				scrollPointer.style.opacity = 0;
				// Remove element once it faded out
				setTimeout(() => scrollPointer.remove(), 1000);
			},
			{ once: true }
		);
	});

	// parameter values
	let parameterState = {};

	// update the UI parameterState to match the tree's genome
	export const updateUIparams = () => (parameterState = { ...tree.genome });

	// update tree parameters on UI input
	const handleParameterChange = (e) => {
		const gene = e.target.dataset.paramid;
		if (!(gene in parameterState)) return;
		tree.updateGene(gene, parameterState[gene]);
		tree.generate(debugStyle);
	};

	// map from range1 to range2 -- to convert all parameters to 0-100%
	const mapValue = (value, x1, y1, x2, y2) => parseInt(((value - x1) * (y2 - x2)) / (y1 - x1) + x2);

	updateUIparams();
</script>

<div bind:this={paramContainer} id="tree-parameters" class="def-scroll">
	<div class="scroll-gradient" />
	<div id="all-params-cont">
		{#each Object.keys(genomeStructure) as gene}
			<div class="param-cont">
				<h4>{genomeDictionary[gene] || gene} <span>({mapValue(parameterState[gene], genomeStructure[gene].min, genomeStructure[gene].max, 0, 100)}%)</span></h4>
				<input type="range" class="def-slider" bind:value={parameterState[gene]} on:input={handleParameterChange} data-paramid={gene} min={genomeStructure[gene].min} max={genomeStructure[gene].max} step={genomeStructure[gene].step} />
			</div>
		{/each}
	</div>
	<div class="scroll-gradient" />
	<div id="scroll-pointer">↓ scroll ↓</div>
</div>

<style>
	#tree-parameters {
		position: relative;
		height: 100px;
		flex: auto;
		overflow-y: scroll;
		border: var(--stroke-size) solid var(--clr-main);
		border-radius: var(--stroke-size);
		margin-top: 0.5rem;
		background-color: var(--clr-background);
	}

	#all-params-cont {
		position: relative;
		top: -2rem;
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
		color: var(--clr-main);
		white-space: nowrap;
	}

	h4 > span {
		font-weight: 400;
		color: var(--clr-secondary);
	}

	.scroll-gradient {
		position: sticky;
		bottom: 0;
		height: 2rem;
		background: linear-gradient(0deg, var(--clr-background) 0%, rgba(var(--lum-background), var(--lum-background), var(--lum-background), 0) 100%);
		pointer-events: none;
	}

	.scroll-gradient:nth-child(1) {
		position: sticky;
		top: 0;
		height: 2rem;
		background: linear-gradient(180deg, var(--clr-background) 0%, rgba(var(--lum-background), var(--lum-background), var(--lum-background), 0) 100%);
		z-index: 99999;
	}

	#scroll-pointer {
		position: sticky;
		bottom: 0;
		padding: 0.5rem;
		text-align: center;
		background-color: var(--clr-background);
		color: var(--clr-main);
		transition: opacity 1s ease;

		/* Flicker animation */
		animation-iteration-count: 7;
		animation-direction: alternate;
		animation-duration: 1s;
		animation-name: scrollFlicker;
	}

	@keyframes scrollFlicker {
		from {
			color: rgba(var(--lum-main), var(--lum-main), var(--lum-main), 0.25);
		}

		to {
			color: var(--clr-main);
		}
	}
</style>
