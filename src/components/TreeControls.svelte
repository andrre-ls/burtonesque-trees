<script>
	import { onMount } from 'svelte';
	import TreeParameters from './TreeParameters.svelte';
	import * as Layout from '../ui-utils/uiLayout.js';

	export let tree, closeAbout;
	export let debugStyle = false;

	let expandedLayout = false;
	let controlsContainer;
	let treeParametersComponent;

	// toggle between expanded and collpased layout
	const handleSwitchLayout = () => {
		expandedLayout = !expandedLayout;

		if (expandedLayout) closeAbout();

		const layoutFunction = expandedLayout ? Layout.expand : Layout.collapse;
		const buttonsContainer = controlsContainer.children[1];

		layoutFunction(buttonsContainer);
	};

	// force collapse layout
	export const collapseLayout = () => {
		expandedLayout = false;
		Layout.collapse(controlsContainer.children[1]);
	};

	// new seed
	const handleNewSeed = () => {
		tree.newSeed();
		tree.generate(debugStyle);
	};

	// reset parameters
	const handleResetParameters = () => {
		tree.resetGenome();
		treeParametersComponent.updateUIparams();
		tree.generate(debugStyle);
	};

	// randomize genome
	const handleRandomizeParamters = () => {
		tree.randomizeGenome();
		treeParametersComponent.updateUIparams();
		tree.generate(debugStyle);
	};

	// export SVG
	const handleDownloadSvg = () => tree.exportSvg();

	// export PNG
	let downloadingPng = false;
	const handleDownloadPng = async () => {
		downloadingPng = true;
		// returns a promise
		await tree.exportPng();
		downloadingPng = false;

		// I'm doing this to avoid multiple clicks before the promise is resolved.
	};

	onMount(() => {
		// switch to expanded layout on small windows
		if (window.innerHeight < 600) handleSwitchLayout();
	});

	// for debugging but I will leave it
	window.getSeed = () => tree.seed;
</script>

<div bind:this={controlsContainer} id="controls-container">
	<section>
		<div class="section-title-button-cont">
			<h3 class="section-title">Tree Parameters</h3>
			<span on:click={handleSwitchLayout} class="no-select">{expandedLayout ? 'collapse' : 'expand'}</span>
		</div>
		<TreeParameters bind:this={treeParametersComponent} {tree} {debugStyle} />
	</section>
	<div>
		<section>
			<h3 class="section-title">Parameter Controls</h3>
			<button class="def-bttn" on:click={handleNewSeed}>New Seed</button>
			<button class="def-bttn" on:click={handleResetParameters}>Reset Parameters</button>
			<button class="def-bttn" on:click={handleRandomizeParamters}>Randomize Parameters</button>
		</section>
		<section>
			<h3 class="section-title">Export</h3>
			<button class="def-bttn" on:click={handleDownloadSvg}>Download SVG</button>
			<button class="def-bttn" on:click={handleDownloadPng} disabled={downloadingPng}>Download PNG</button>
		</section>
	</div>
</div>

<style>
	#controls-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	section,
	#controls-container > div {
		margin-top: 2.75rem;
		width: 100%;
	}

	section:first-child {
		margin-top: 0;
		flex: auto;
		display: flex;
		flex-direction: column;
	}
</style>
