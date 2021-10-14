<script>
	import TreeParameters from './TreeParameters.svelte';
	import * as Layout from '../ui-utils/uiLayout.js';

	export let tree;

	let expandedLayout = false;
	let controlsContainer;
	let treeParametersComponent;

	// toggle between expanded and collpased layout
	const handleSwitchLayout = () => {
		expandedLayout = !expandedLayout;

		const layoutFunction = expandedLayout ? Layout.expand : Layout.collapse;
		const [paramsContainer, buttonsContainer] = controlsContainer.children;

		// TODO: refactor functions -- first param is not currently needed
		layoutFunction(controlsContainer, paramsContainer, buttonsContainer);
	};

	const handleNewSeed = () => {
		tree.newSeed();
		tree.generate();
	};

	// reset parameters. Function is on the <TreeParameters> components
	const handleResetParameters = () => treeParametersComponent.resetParameters();

	// TODO:
	const handleRandomizeParamters = () => {};

	const handleDownloadSvg = () => tree.exportSvg();

	let downloadingPng = false;
	const handleDownloadPng = async () => {
		downloadingPng = true;
		// returns a promise
		await tree.exportPng();
		downloadingPng = false;

		// I'm doing this to avoid multiple clicks before the promise is resolved.
	};
</script>

<div bind:this={controlsContainer} id="controls-container">
	<section>
		<div class="title-plus-button">
			<h3>Tree Parameters</h3>
			<span on:click={handleSwitchLayout} class="no-select">{expandedLayout ? 'collapse' : 'expand'}</span>
		</div>
		<TreeParameters bind:this={treeParametersComponent} {tree} />
	</section>
	<div>
		<section>
			<h3>Parameter Controls</h3>
			<button class="def-bttn" on:click={handleNewSeed}>New Seed</button>
			<button class="def-bttn" on:click={handleResetParameters}>Reset Parameters</button>
			<button class="def-bttn" on:click={handleRandomizeParamters}>Randomize Parameters</button>
		</section>
		<section>
			<h3>Export</h3>
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

	h3 {
		font-size: 1.2rem;
		font-style: italic;
		font-weight: 700;
		margin: 0;
		margin-bottom: 0.5rem;
		color: var(--clr-main);
	}

	.title-plus-button {
		display: flex;
		justify-content: space-between;
				align-items: baseline;
	}

	.title-plus-button > span {
		font-size: 1rem;
		font-weight: 500;
		font-style: italic;
		cursor: pointer;
		color: var(--clr-secondary);
		/* So the button is has a bigger bounding box and is therefore easier to click */
		padding: 0.5rem 1rem;
		transform: translateX(1rem);
		text-align: right;
	}

	.title-plus-button > span:hover {
		color: var(--clr-focus-bg);
	}
</style>
